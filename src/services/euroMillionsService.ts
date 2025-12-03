import { prisma } from '@/lib/prisma';
import { evaluateDraw, updateRanking, cachePredictions } from './ranking';
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

export class EuroMillionsService {
    async fetchLatestDraw(): Promise<DrawData> {
        try {
            const agent = new https.Agent({ rejectUnauthorized: false });
            const response = await fetch('https://www.jogossantacasa.pt/web/SCCartazResult/euroMilhoes', {
                // @ts-ignore - node-fetch supports agent, native fetch in Node 18+ might need custom dispatcher or this might work if polyfilled
                agent
            });
            const text = await response.text();

            // Extract Date
            const dateMatch = text.match(/Data do Sorteio - (\d{2}\/\d{2}\/\d{4})/);
            if (!dateMatch) throw new Error('Could not find draw date');

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

    async updateDatabase() {
        try {
            const latestDraw = await this.fetchLatestDraw();
            const drawDate = new Date(latestDraw.date);

            const existing = await prisma.draw.findUnique({
                where: { date: drawDate },
            });

            if (!existing) {
                const newDraw = await prisma.draw.create({
                    data: {
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

                // --- AUTOMATIC RANKING UPDATE ---
                console.log(`✨ Triggering automatic ranking update...`);
                try {
                    await evaluateDraw(newDraw.id);
                    await updateRanking();
                    await cachePredictions();
                    console.log(`✅ Rankings updated successfully.`);
                } catch (rankError) {
                    console.error('❌ Failed to update rankings:', rankError);
                }
                // --------------------------------

            } else {
                // Update existing if needed (e.g. draw order was missing)
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
                    console.log(`Draw for ${latestDraw.date} already exists`);
                }
            }
        } catch (error) {
            console.error('Error updating database:', error);
        }
    }

    async seedFromArchive() {
        const startYear = 2004;
        const currentYear = new Date().getFullYear();

        for (let year = startYear; year <= currentYear; year++) {
            console.log(`Fetching archive for ${year}...`);
            try {
                const response = await fetch(`https://www.euro-millions.com/results-archive-${year}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });
                const text = await response.text();
                const rows = text.split('<tr class="resultRow"');

                for (let i = 1; i < rows.length; i++) {
                    const rowHtml = rows[i];
                    try {
                        const urlMatch = rowHtml.match(/\/results\/(\d{2}-\d{2}-\d{4})/);
                        if (!urlMatch) continue;

                        const dateStr = urlMatch[1];
                        const [day, month, yearStr] = dateStr.split('-');
                        const isoDate = `${yearStr}-${month}-${day}`;
                        const drawDate = new Date(isoDate);

                        const numbers: number[] = [];
                        const numberMatches = rowHtml.matchAll(/class="resultBall ball small">(\d+)<\/li>/g);
                        for (const match of numberMatches) {
                            numbers.push(parseInt(match[1], 10));
                        }

                        const stars: number[] = [];
                        const starMatches = rowHtml.matchAll(/class="resultBall lucky-star small">(\d+)<\/li>/g);
                        for (const match of starMatches) {
                            stars.push(parseInt(match[1], 10));
                        }

                        let jackpot: number | undefined = undefined;
                        const jackpotMatch = rowHtml.match(/&euro;([\d,]+)/);
                        if (jackpotMatch) {
                            jackpot = parseInt(jackpotMatch[1].replace(/,/g, ''), 10);
                        }

                        if (numbers.length === 5 && stars.length === 2) {
                            const existing = await prisma.draw.findUnique({
                                where: { date: drawDate },
                            });

                            if (!existing) {
                                await prisma.draw.create({
                                    data: {
                                        date: drawDate,
                                        numbers: JSON.stringify(numbers),
                                        stars: JSON.stringify(stars),
                                        jackpot: jackpot,
                                        hasWinner: false,
                                    },
                                });
                                console.log(`Seeded draw for ${isoDate}`);
                            }
                        }
                    } catch (err) {
                        console.error('Error parsing row:', err);
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch archive for ${year}:`, error);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    async getHistory() {
        const draws = await prisma.draw.findMany({
            orderBy: { date: 'desc' },
        });
        return draws.map(d => ({
            ...d,
            numbers: JSON.parse(d.numbers) as number[],
            stars: JSON.parse(d.stars) as number[],
            numbersDrawOrder: d.numbersDrawOrder ? JSON.parse(d.numbersDrawOrder) as number[] : undefined,
            starsDrawOrder: d.starsDrawOrder ? JSON.parse(d.starsDrawOrder) as number[] : undefined,
        }));
    }
}
