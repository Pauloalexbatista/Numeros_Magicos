
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
            const latestDraw = await this.fetchLatest();
            const dayStr = latestDraw.date.split('T')[0];
            const drawDate = new Date(dayStr + "T12:00:00Z");
            const startOfDay = new Date(dayStr + "T00:00:00Z");
            const endOfDay = new Date(dayStr + "T23:59:59Z");

            const existing = await prisma.draw.findFirst({
                where: {
                    game: this.GAME_KEY,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
            });

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
                
                console.log(`✅ [EuroDreams] New draw added for ${latestDraw.date}`);

                await evaluateDraw(newDraw.id);
                await evaluateDrawStars(newDraw.id);
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


}
