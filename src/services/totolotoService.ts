
import { IGameService } from './interfaces/gameService';
import { prisma } from '@/lib/prisma';
import { evaluateDraw, updateRanking, cachePredictions, evaluateDrawStars } from './ranking';
import { updateAllStatisticsCache } from './cache/statisticsCache';
import https from 'https';

interface DrawData {
    date: string;
    numbers: number[];
    stars: number[];
    numbersDrawOrder: number[];
    starsDrawOrder: number[];
    jackpot: number;
    hasWinner: boolean;
}

export class TotolotoService implements IGameService {
    private readonly BASE_URL = 'https://www.jogossantacasa.pt/web/SCCartazResult/totolotoNew';

    async fetchLatest(): Promise<DrawData> {
        try {
            const agent = new https.Agent({ rejectUnauthorized: false });
            const response = await fetch(this.BASE_URL, {
                // @ts-ignore
                agent: agent,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                }
            });
            const text = await response.text();

            // 1. Extract Date (Case-insensitive)
            const dateMatch = text.match(/Data do Sorteio - (\d{2}\/\d{2}\/\d{4})/i);
            if (!dateMatch) {
                console.error('❌ Could not find Totoloto draw date.');
                throw new Error('Could not find draw date');
            }

            const dateParts = dateMatch[1].split('/');
            const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // YYYY-MM-DD

            // 2. Extract Numbers & Lucky Number
            // <li>10 21 30 37 49 + 8</li>
            // Note: Sometimes it might be formatted differently, but this is the standard container
            const numbersLineMatch = text.match(/<li>\s*([\d\s]+)\s+\+\s+([\d\s]+)\s*<\/li>/);

            let numbers: number[] = [];
            let stars: number[] = []; // Lucky Number

            if (numbersLineMatch) {
                const numbersStr = numbersLineMatch[1].trim();
                const luckyNumberStr = numbersLineMatch[2].trim();

                numbers = numbersStr.split(/\s+/).map(n => parseInt(n)).sort((a, b) => a - b);
                stars = [parseInt(luckyNumberStr)]; // Totoloto only has 1 "Star" (Numero da Sorte)
            } else {
                throw new Error('Could not find numbers/lucky number');
            }

            // 3. Extract Jackpot
            // Look for "Previsão 1º Prémio... € 4.400.000,00" OR "Jackpot"
            // In the dump: <li class="stronger">&euro; 4.400.000,00</li>
            // Warning: The dump shows "Previsão" (Forecast) for NEXT draw if nobody won?
            // Or is it the jackpot of THIS draw?
            // Usually "1.º Prémio" row has the value.
            // Dump: <li>1.º Prémio</li> ... <li>(1)</li> (Winners) ... but value is empty line?
            // Actually, for "1.º Prémio" it shows:
            // <li>0</li> (winners)
            // <li>(1)</li> (accumulated?)
            // And below in "Estatísticas": "(1) Previsão 1º Prémio c / Jackpot ... € 4.400.000,00"

            // Let's try to find the "1.º Prémio" amount if it exists, or the Jackpot value.
            // Simple regex for money with € symbol might pick up the jackpot.
            // We want the HIGHEST value on the page usually.

            const jackpotMatch = text.match(/class="stronger">\s*&euro;\s*([\d\.]+),(\d{2})/);
            let jackpot = 0;
            if (jackpotMatch) {
                const amountStr = jackpotMatch[1].replace(/\./g, '') + '.' + jackpotMatch[2];
                jackpot = parseFloat(amountStr);
            }

            return {
                date: isoDate,
                numbers,
                stars, // Lucky Number
                numbersDrawOrder: [...numbers], // We don't have draw order from this HTML, assumes sorted
                starsDrawOrder: [...stars],
                jackpot,
                hasWinner: false // Default
            };

        } catch (error) {
            console.error('Error fetching Totoloto:', error);
            throw error;
        }
    }

    async updateDatabase(force: boolean = false): Promise<boolean> {
        try {
            const latestDraw = await this.fetchLatest();
            const drawDate = new Date(latestDraw.date.split('T')[0] + "T12:00:00Z");
            const startOfDay = new Date(latestDraw.date.split('T')[0] + "T00:00:00Z");
            const endOfDay = new Date(latestDraw.date.split('T')[0] + "T23:59:59Z");

            const existing = await prisma.draw.findFirst({
                where: {
                    game: 'TOTOLOTO',
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
            });

            if (!existing) {
                const newDraw = await prisma.draw.create({
                    data: {
                        game: 'TOTOLOTO',
                        date: drawDate,
                        numbers: JSON.stringify(latestDraw.numbers),
                        stars: JSON.stringify(latestDraw.stars),
                        numbersDrawOrder: JSON.stringify(latestDraw.numbers),
                        starsDrawOrder: JSON.stringify(latestDraw.stars),
                        jackpot: latestDraw.jackpot,
                        hasWinner: latestDraw.hasWinner,
                    },
                });
                
                console.log(`✅ [Totoloto] New draw added for ${latestDraw.date}`);

                await evaluateDraw(newDraw.id);
                await evaluateDrawStars(newDraw.id);
                await updateRanking();
                await cachePredictions();
                await updateAllStatisticsCache();

                return true;
            } else {
                console.log(`ℹ️ [Totoloto] Draw ${latestDraw.date} already exists.`);
                return false;
            }
        } catch (error) {
            console.error('[Totoloto] Update failed:', error);
            return false;
        }
    }


}
