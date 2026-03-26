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

    async updateDatabase(force: boolean = false): Promise<boolean> {
        try {
            // 1. Smart Gap Filling (Ensure no holes in history)
            let gapFilledCount = 0;
            try {
                gapFilledCount = await this.syncMissingDraws(force);
            } catch (gapError) {
                console.error('⚠️ Gap filling failed (continuing to latest draw):', gapError);
            }

            const latestDraw = await this.fetchLatest();
            const drawDate = new Date(latestDraw.date);

            const existing = await prisma.draw.findFirst({
                where: {
                    game: 'EUROMILLIONS',
                    date: drawDate
                },
            });

            // If we have a new draw OR we just filled gaps, we must update rankings
            if (!existing || gapFilledCount > 0) {

                let newDrawId = existing?.id;

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
                    newDrawId = newDraw.id;
                    console.log(`✅ New draw added for ${latestDraw.date}`);
                } else {
                    console.log(`ℹ️ Latest draw already exists (via Gap Filling), but proceeding with full update.`);
                }

                // --- AUTOMATIC RANKING UPDATE ---
                console.log(`✨ Triggering automatic ranking update...`);
                try {
                    // If regular new draw, evaluate it. 
                    // If gap filled, those draws were evaluated in seedFromArchive (we will add logic there),
                    // but we might need to evaluate the VERY latest if it was part of gap filling?
                    // Yes, if existing is true (gap filled it), we assume seedFromArchive evaluated it.
                    // But to be safe, if we have newDrawId and it wasn't evaluated yet...
                    // Actually, let's just ensure we run the global updates.

                    if (newDrawId && !existing) {
                        // Only evaluate here if we just created it manually 
                        // (i.e. it wasn't in gap filling)
                        await evaluateDraw(newDrawId);
                        await evaluateDrawStars(newDrawId); // ⭐ Fix: evaluate star systems too
                    }

                    await updateRanking();
                    await cachePredictions();

                    // --- STATISTICS CACHE UPDATE ---
                    await updateAllStatisticsCache();
                    // -------------------------------

                    console.log(`✅ Rankings and Statistics updated successfully.`);
                } catch (rankError) {
                    console.error('❌ Failed to update rankings:', rankError);
                }
                // --------------------------------

                return true; // New data available

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
                return false; // No new draw
            }
        } catch (error) {
            console.error('Error updating database:', error);
            return false;
        }
    }

    /**
     * Smart Gap Filling: Automatically finds and fetches missing draws
     */
    async syncMissingDraws(force: boolean = false): Promise<number> {
        console.log(`🔄 Checking for missing draws (Gap Filling) [Force: ${force}]...`);

        const lastDraw = await prisma.draw.findFirst({
            orderBy: { date: 'desc' },
            where: { game: 'EUROMILLIONS' }
        });

        if (!lastDraw) {
            console.log('⚠️ No draws in DB. Running full seed...');
            await this.seedFromArchive(2004);
            return -1; // Unknown count
        }

        const lastDbDate = lastDraw.date;
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastDbDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (!force && diffDays <= 4) {
            console.log('✅ DB is up to date (less than 4 days old).');
            return 0;
        }

        console.log(`⚠️ Database needs sync (${diffDays} days old or Forced). Scanning years to find holes...`);

        const startYear = lastDbDate.getFullYear();
        const currentYear = now.getFullYear();
        let totalAdded = 0;

        for (let year = startYear; year <= currentYear; year++) {
            totalAdded += await this.seedFromArchive(year, lastDbDate);
        }

        if (totalAdded > 0) {
            console.log(`✨ Successfully filled gap with ${totalAdded} new draws.`);
        } else {
            console.log('🤷 No new draws found in archive despite the gap.');
        }

        return totalAdded;
    }

    async seedFromArchive(yearOrStartYear: number, minDate?: Date): Promise<number> {
        // Support legacy call signature or new one
        const year = yearOrStartYear;
        const currentYear = new Date().getFullYear();

        // If called with just start year for full history (legacy support)
        if (!minDate && year < currentYear - 1) {
            // This logic was for the loop in the old function. 
            // To keep it simple, if no minDate is provided, we assume we want EVERYTHING from that year.
        }

        console.log(`Fetching archive for ${year}...`);
        let addedCount = 0;

        try {
            const response = await fetch(`https://www.euro-millions.com/results-archive-${year}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            const text = await response.text();
            const rows = text.split('<tr class="resultRow"');

            // Process oldest first if possible, but the archive is desc. 
            // So we collect all candidates then insert ascending.
            const candidates: any[] = [];

            for (let i = 1; i < rows.length; i++) {
                const rowHtml = rows[i];
                try {
                    const urlMatch = rowHtml.match(/\/results\/(\d{2}-\d{2}-\d{4})/);
                    if (!urlMatch) continue;

                    const dateStr = urlMatch[1];
                    const [day, month, yearStr] = dateStr.split('-');
                    const isoDate = `${yearStr}-${month}-${day}`;
                    const drawDate = new Date(isoDate);

                    // Skip if older than minDate (if provided)
                    if (minDate && drawDate <= minDate) continue;

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
                        // Add to candidates logic
                        candidates.push({
                            date: drawDate,
                            numbers: JSON.stringify(numbers),
                            stars: JSON.stringify(stars),
                            jackpot: jackpot,
                            hasWinner: false
                        });
                    }
                } catch (err) {
                    console.error('Error parsing row:', err);
                }
            }

            // Sort ascending (Oldest missing first)
            candidates.sort((a, b) => a.date.getTime() - b.date.getTime());

            for (const candidate of candidates) {
                const existing = await prisma.draw.findFirst({
                    where: {
                        game: 'EUROMILLIONS',
                        date: candidate.date
                    },
                });

                if (!existing) {
                    const newDraw = await prisma.draw.create({
                        data: {
                            game: 'EUROMILLIONS',
                            date: candidate.date,
                            numbers: candidate.numbers,
                            stars: candidate.stars,
                            jackpot: candidate.jackpot,
                            hasWinner: candidate.hasWinner,
                        },
                    });

                    // Evaluate performance immediately for this draw
                    // (Critical for correct calculation of subsequent draws)
                    try {
                        await evaluateDraw(newDraw.id);
                        await evaluateDrawStars(newDraw.id); // STARS
                    } catch (e) {
                        console.error(`⚠️ Failed to evaluate draw ${newDraw.id}:`, e);
                    }

                    console.log(`✅ Seeded missing draw for ${candidate.date.toISOString().split('T')[0]}`);

                    // Trigger ranking update for each new draw to keep consistency
                    // OR we can do it in bulk after. Doing it here ensures correctness but is slower.
                    // Given this is "Gap Filling", slowness is acceptable for correctness.
                    /* 
                       NOTE: Updating rankings here might be too heavy if we are filling 1 year.
                       The caller (updateDatabase) usually triggers one update at the end.
                       However, system performance depends on history. 
                       If we insert Draw A, then Draw B. Draw B needs Draw A in history to be calculated correctly.
                       So we MUST evaluate Draw A before inserting Draw B?
                       Actually, `evaluateDraw` calculates performance *for that draw*.
                       So if we insert A, then B.
                       When we run `evaluateDraw(B)`, it asks for history < B.date.
                       Since A is in DB, it is included.
                       So we don't need to run `evaluateDraw(A)` before inserting B.
                       We just need to make sure A is in DB.
                    */

                    addedCount++;
                }
            }

        } catch (error) {
            console.error(`Failed to fetch archive for ${year}:`, error);
        }

        return addedCount;
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
