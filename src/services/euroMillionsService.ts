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

import { IGameService } from './interfaces/gameService';

export class EuroMillionsService implements IGameService {
    async fetchLatest(): Promise<DrawData> {
        try {
            const agent = new https.Agent({ rejectUnauthorized: false });
            const response = await fetch('https://www.jogossantacasa.pt/web/SCCartazResult/euroMilhoes', {
                // @ts-ignore - node-fetch supports agent, native fetch in Node 18+ might need custom dispatcher or this might work if polyfilled
                agent
            });
            const text = await response.text();

            // Extract Date (Case-insensitive to handle DATA DO SORTEIO)
            const dateMatch = text.match(/Data do Sorteio - (\d{2}\/\d{2}\/\d{4})/i);
            if (!dateMatch) {
                console.error('❌ Could not find draw date. Site structure may have changed.');
                // console.debug('Page content snippet:', text.substring(0, 500));
                throw new Error('Could not find draw date');
            }

            const dateParts = dateMatch[1].split('/');
            const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

            // Extract Numbers
            // Format: <li>4 13 14 20 41 + 6 12</li>
            const numbersLineMatch = text.match(/<li>\s*([\d\s]+)\s+\+\s+([\d\s]+)\s*<\/li>/);

            let numbers: number[] = [];
            let stars: number[] = [];
            let numbersDrawOrder: number[] = [];
            let starsDrawOrder: number[] = [];

            if (numbersLineMatch) {
                const numbersStr = numbersLineMatch[1].trim();
                const starsStr = numbersLineMatch[2].trim();

                numbers = numbersStr.split(/\s+/).map(n => parseInt(n));
                stars = starsStr.split(/\s+/).map(n => parseInt(n));

                // Save draw order before sorting
                numbersDrawOrder = [...numbers];
                starsDrawOrder = [...stars];

                numbers.sort((a, b) => a - b);
                stars.sort((a, b) => a - b);
            } else {
                // Fallback to old method or throw
                // Try finding individual LIs just in case (though debug showed the new format)
                const individualMatch = text.match(/<li>(\d+)<\/li>/g);
                if (individualMatch && individualMatch.length >= 7) {
                    const allNumbers = individualMatch.map(n => parseInt(n.replace(/<\/?li>/g, '')));
                    numbers = allNumbers.slice(0, 5).sort((a, b) => a - b);
                    stars = allNumbers.slice(5, 7).sort((a, b) => a - b);
                    numbersDrawOrder = allNumbers.slice(0, 5);
                    starsDrawOrder = allNumbers.slice(5, 7);
                } else {
                    throw new Error('Could not find numbers');
                }
            }

            // Extract Jackpot
            // <span class="jackpot">17.000.000,00 €</span>
            const jackpotMatch = text.match(/<span class="jackpot">([\d\.]+),(\d{2}) €<\/span>/);
            let jackpot = 0;
            if (jackpotMatch) {
                const amountStr = jackpotMatch[1].replace(/\./g, '') + '.' + jackpotMatch[2];
                jackpot = parseFloat(amountStr);
            }

            return {
                date: isoDate,
                numbers,
                stars,
                numbersDrawOrder,
                starsDrawOrder,
                jackpot,
                hasWinner: false // Default, would need more parsing to know for sure
            };

        } catch (error) {
            console.error('Error fetching latest draw:', error);
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
                    game: 'EUROMILLIONS',
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
            });

            if (!existing) {
                const newDraw = await prisma.draw.create({
                    data: {
                        game: 'EUROMILLIONS',
                        date: drawDate,
                        numbers: JSON.stringify(latestDraw.numbers),
                        stars: JSON.stringify(latestDraw.stars),
                        numbersDrawOrder: JSON.stringify(latestDraw.numbersDrawOrder),
                        starsDrawOrder: JSON.stringify(latestDraw.starsDrawOrder),
                        jackpot: latestDraw.jackpot,
                        hasWinner: latestDraw.hasWinner,
                    },
                });
                
                console.log(`✅ New draw added for ${latestDraw.date}`);

                await evaluateDraw(newDraw.id);
                await evaluateDrawStars(newDraw.id);
                await updateRanking();
                await cachePredictions();
                await updateAllStatisticsCache();

                return true;
            } else {
                if (!existing.numbersDrawOrder) {
                    await prisma.draw.update({
                        where: { id: existing.id },
                        data: {
                            numbersDrawOrder: JSON.stringify(latestDraw.numbersDrawOrder),
                            starsDrawOrder: JSON.stringify(latestDraw.starsDrawOrder)
                        }
                    });
                    console.log(`Updated draw order for ${latestDraw.date}`);
                } else {
                    console.log(`ℹ️ [EuroMillions] Draw ${latestDraw.date} already exists.`);
                }
                return false;
            }
        } catch (error) {
            console.error('[EuroMillions] Update failed:', error);
            return false;
        }
    }



    async getHistory() {
        const draws = await prisma.draw.findMany({
            orderBy: { date: 'desc' },
        });
        return draws.map(d => ({
            ...d,
            numbers: (typeof d.numbers === 'string' ? (typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers) : d.numbers) as number[],
            stars: (typeof d.stars === 'string' ? (typeof d.stars === "string" ? JSON.parse(d.stars) : d.stars) : d.stars) as number[],
            numbersDrawOrder: d.numbersDrawOrder ? (typeof d.numbersDrawOrder === 'string' ? JSON.parse(d.numbersDrawOrder) : d.numbersDrawOrder) as number[] : undefined,
            starsDrawOrder: d.starsDrawOrder ? (typeof d.starsDrawOrder === 'string' ? JSON.parse(d.starsDrawOrder) : d.starsDrawOrder) as number[] : undefined,
        }));
    }
}
