
import { IGameService } from './interfaces/gameService';
import { prisma } from '@/lib/prisma';
import { evaluateDraw, updateRanking, cachePredictions, evaluateDrawStars } from './ranking';
import { updateAllStatisticsCache } from './cache/statisticsCache';
import https from 'https';
import fetch from 'node-fetch';

interface DrawData {
    date: string;
    numbers: number[];
    stars: number[];
    numbersDrawOrder: number[];
    starsDrawOrder: number[];
    jackpot: number;
    hasWinner: boolean;
}

export class EuroDreamsService implements IGameService {
    private readonly BASE_URL = 'https://loteriaguru.com/resultados-do-eurodreams';
    private readonly BASE_ARCHIVE_URL = 'https://loteriaguru.com/portugal-resultados-loteria/pt-eurodreams/pt-eurodreams-historico-de-resultados';

    // EuroDreams specific game constants
    private readonly GAME_KEY = 'EURODREAMS';

    async fetchLatest(): Promise<DrawData> {
        // Implementation for latest draw (if needed, but seedFromArchive is primary for init)
        // For now, we reuse the archive scraping logic or rely on the seed script
        throw new Error("Method not implemented.");
    }

    async updateDatabase(): Promise<boolean> {
        // Not implemented for now, focus on seeding
        return false;
    }

    async seedFromArchive(limitYear: number = 2023): Promise<number> {
        console.log(`[EuroDreams] Seeding from archive (until ${limitYear})...`);

        let page = 1;
        let importedCount = 0;
        let consecutiveFailures = 0;

        const KEYWORD_MONTHS: { [key: string]: string } = {
            'jan.': '01', 'fev.': '02', 'mar.': '03', 'abr.': '04', 'mai.': '05', 'jun.': '06',
            'jul.': '07', 'ago.': '08', 'set.': '09', 'out.': '10', 'nov.': '11', 'dez.': '12'
        };

        const agent = new https.Agent({ rejectUnauthorized: false });

        while (true) {
            const url = `${this.BASE_ARCHIVE_URL}?page=${page}`;
            console.log(`[EuroDreams] Fetching page ${page}...`);

            try {
                const response = await fetch(url, {
                    // @ts-ignore
                    agent: agent,
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });

                if (!response.ok) {
                    console.log(`[EuroDreams] Page ${page} failed with status ${response.status}`);
                    break;
                }

                const text = await response.text();
                const validLines = text.split('lg-line').slice(1);

                if (validLines.length === 0) {
                    console.log(`[EuroDreams] No data found on page ${page}. Stopping.`);
                    break;
                }

                let pageHasNewData = false;
                let reachedLimit = false;

                for (const block of validLines) {
                    // Extract Date
                    const dateMatch = block.match(/(\d{1,2})\s+([a-zç\.]+)\s*<\/strong>\s*(\d{4})/i);
                    if (!dateMatch) continue;

                    const day = dateMatch[1].padStart(2, '0');
                    const monthStr = dateMatch[2].toLowerCase();
                    const year = parseInt(dateMatch[3]);
                    const month = KEYWORD_MONTHS[monthStr];

                    if (!month) {
                        console.warn(`[EuroDreams] Unknown month: ${monthStr}`);
                        continue;
                    }

                    if (year < limitYear) {
                        reachedLimit = true;
                        break;
                    }

                    const isoDate = `${year}-${month}-${day}`;
                    const drawDate = new Date(isoDate);

                    // Extract Numbers
                    const blockNumbersPart = block.split('lg-numbers-small')[1]?.split('</ul>')[0];
                    if (!blockNumbersPart) continue;

                    const numberMatches = [...blockNumbersPart.matchAll(/class="lg-number[^"]*">(\d+)</g)];
                    let allNumbers = numberMatches.map(m => parseInt(m[1]));

                    // EuroDreams: 6 Main Numbers + 1 Dream Number
                    // Site usually lists them all together. Last one is Dream Number (often distinct color, but in text just a number)

                    if (allNumbers.length < 7) {
                        // console.warn(`[EuroDreams] Found fewer than 7 numbers for ${isoDate}: ${allNumbers}`);
                        continue;
                    }

                    // Last one is Dream Number
                    const dreamNumber = allNumbers.pop();
                    const mainNumbers = allNumbers.sort((a, b) => a - b);
                    const stars = [dreamNumber!]; // "Stars" field stores Dream Number

                    // Check if already exists
                    const existing = await prisma.draw.findFirst({
                        where: {
                            game: this.GAME_KEY,
                            date: drawDate
                        },
                    });

                    if (!existing) {
                        // Calculate a sequence number if possible (based on date) usually handled by DB autoincrement ID, 
                        // but logic might need Year * 1000 + Index if we want custom sequence.
                        // For now let's rely on date unique constraint.

                        await prisma.draw.create({
                            data: {
                                game: this.GAME_KEY,
                                date: drawDate,
                                numbers: JSON.stringify(mainNumbers),
                                stars: JSON.stringify(stars),
                                numbersDrawOrder: JSON.stringify(mainNumbers),
                                starsDrawOrder: JSON.stringify(stars),
                                jackpot: 0, // EuroDreams is annuity, often listed as 20000/month. We might parse differently or set 0.
                                hasWinner: false,
                            },
                        });
                        console.log(`✅ [EuroDreams] Imported: ${isoDate} | ${mainNumbers.join(',')} + ${stars}`);
                        importedCount++;
                        pageHasNewData = true;
                    }
                }

                if (reachedLimit) {
                    console.log(`[EuroDreams] Reached year limit ${limitYear}. Stopping.`);
                    break;
                }

                page++;
                await new Promise(r => setTimeout(r, 200));

            } catch (error) {
                console.error(`[EuroDreams] Error processing page ${page}:`, error);
                break;
            }
        }

        if (importedCount > 0) {
            // We will handle ranking updates in the seed script or here
            console.log('[EuroDreams] Import finished.');
        }

        return importedCount;
    }
}
