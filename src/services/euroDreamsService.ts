
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
        console.log(`[EuroDreams] Fetching latest draw...`);
        const url = `${this.BASE_ARCHIVE_URL}?page=1`;

        try {
            const agent = new https.Agent({ rejectUnauthorized: false });
            const response = await fetch(url, {
                // @ts-ignore
                agent: agent,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });

            if (!response.ok) throw new Error(`Failed to fetch latest: ${response.status}`);

            const text = await response.text();
            const validLines = text.split('lg-line').slice(1);

            if (validLines.length === 0) throw new Error("No data found");

            // Parse the first block (latest draw)
            const block = validLines[0];
            const dateMatch = block.match(/(\d{1,2})\s+([a-zç\.]+)\s*<\/strong>\s*(\d{4})/i);

            if (!dateMatch) throw new Error("Could not parse date");

            const KEYWORD_MONTHS: { [key: string]: string } = {
                'jan.': '01', 'fev.': '02', 'mar.': '03', 'abr.': '04', 'mai.': '05', 'jun.': '06',
                'jul.': '07', 'ago.': '08', 'set.': '09', 'out.': '10', 'nov.': '11', 'dez.': '12'
            };

            const day = dateMatch[1].padStart(2, '0');
            const monthStr = dateMatch[2].toLowerCase();
            const year = parseInt(dateMatch[3]);
            const month = KEYWORD_MONTHS[monthStr];

            if (!month) throw new Error(`Unknown month: ${monthStr}`);

            const isoDate = `${year}-${month}-${day}`;

            // Extract Numbers
            const blockNumbersPart = block.split('lg-numbers-small')[1]?.split('</ul>')[0];
            if (!blockNumbersPart) throw new Error("Could not parse numbers");

            const numberMatches = [...blockNumbersPart.matchAll(/class="lg-number[^"]*">(\d+)</g)];
            let allNumbers = numberMatches.map(m => parseInt(m[1]));

            if (allNumbers.length < 7) throw new Error("Invalid number count");

            const dreamNumber = allNumbers.pop()!;
            const mainNumbers = allNumbers.sort((a, b) => a - b);

            return {
                date: isoDate,
                numbers: mainNumbers,
                stars: [dreamNumber],
                numbersDrawOrder: mainNumbers, // Order usually not preserved in this scrape
                starsDrawOrder: [dreamNumber],
                jackpot: 0,
                hasWinner: false
            };

        } catch (error) {
            console.error("[EuroDreams] Error fetching latest:", error);
            throw error;
        }
    }

    async updateDatabase(force: boolean = false): Promise<boolean> {
        try {
            // 1. Gap Filling
            let gapFilledCount = 0;
            try {
                gapFilledCount = await this.syncMissingDraws(force);
            } catch (gapError) {
                console.error('⚠️ [EuroDreams] Gap filling failed:', gapError);
            }

            const latestDraw = await this.fetchLatest();
            const drawDate = new Date(latestDraw.date);

            const existing = await prisma.draw.findFirst({
                where: {
                    game: this.GAME_KEY,
                    date: drawDate
                },
            });

            if (!existing || gapFilledCount > 0) {
                let newDrawId = existing?.id;

                if (!existing) {
                    const newDraw = await prisma.draw.create({
                        data: {
                            game: this.GAME_KEY,
                            date: drawDate,
                            numbers: JSON.stringify(latestDraw.numbers),
                            stars: JSON.stringify(latestDraw.stars),
                            numbersDrawOrder: JSON.stringify(latestDraw.numbers),
                            starsDrawOrder: JSON.stringify(latestDraw.stars),
                            jackpot: 0,
                            hasWinner: false,
                        },
                    });
                    newDrawId = newDraw.id;
                    console.log(`✅ [EuroDreams] New draw added for ${latestDraw.date}`);
                }

                // Full evaluation pipeline
                if (newDrawId && !existing) {
                    await evaluateDraw(newDrawId);
                    await evaluateDrawStars(newDrawId);
                }

                await updateRanking();
                await cachePredictions();
                await updateAllStatisticsCache();

                return true;
            } else {
                console.log(`ℹ️ [EuroDreams] Draw ${latestDraw.date} already exists.`);
                return false;
            }
        } catch (error) {
            console.error('[EuroDreams] Update failed:', error);
            return false;
        }
    }

    /**
     * Smart Gap Filling
     */
    async syncMissingDraws(force: boolean = false): Promise<number> {
        console.log(`🔄 [EuroDreams] Checking for missing draws [Force: ${force}]...`);

        const lastDraw = await prisma.draw.findFirst({
            where: { game: this.GAME_KEY },
            orderBy: { date: 'desc' }
        });

        if (!lastDraw) {
            return await this.seedFromArchive(2023);
        }

        const lastDbDate = lastDraw.date;
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now.getTime() - lastDbDate.getTime()) / (1000 * 60 * 60 * 24));

        if (!force && diffDays <= 3) return 0; // Mon/Thu draws

        console.log(`⚠️ [EuroDreams] Syncing missing draws since 2023 (Forced or ${diffDays} days old)...`);
        return await this.seedFromArchive(2023); // Always scan from start of game 2023 if forced/gap
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
