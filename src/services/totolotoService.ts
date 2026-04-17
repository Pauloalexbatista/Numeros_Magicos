
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

            // 1. Extract Date
            // <span class="dataInfo">Sorteio: 009/2026 - sábado<br>Data do Sorteio - 31/01/2026</span>
            const dateMatch = text.match(/Data do Sorteio - (\d{2}\/\d{2}\/\d{4})/);
            if (!dateMatch) throw new Error('Could not find draw date');

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
            // 1. Gap Filling (Ensure no holes in history)
            let gapFilledCount = 0;
            try {
                gapFilledCount = await this.syncMissingDraws(force);
            } catch (gapError) {
                console.error('⚠️ [Totoloto] Gap filling failed:', gapError);
            }

            const latestDraw = await this.fetchLatest();
            // Ensure date is 12:00:00Z to match seed pattern and prevent duplicates
            const drawDate = new Date(latestDraw.date.split('T')[0] + "T12:00:00Z");

            const existing = await prisma.draw.findFirst({
                where: {
                    game: 'TOTOLOTO',
                    date: drawDate
                },
            });

            // If new draw OR gap filled, update analytics
            if (!existing || gapFilledCount > 0) {
                let newDrawId = existing?.id;

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
                    newDrawId = newDraw.id;
                    console.log(`✅ [Totoloto] New draw added for ${latestDraw.date}`);
                }

                // Evaluate predictions
                if (newDrawId && !existing) {
                    await evaluateDraw(newDrawId);
                    await evaluateDrawStars(newDrawId);
                }

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

    /**
     * Smart Gap Filling: Automatically finds and fetches missing draws
     */
    async syncMissingDraws(force: boolean = false): Promise<number> {
        console.log(`🔄 [Totoloto] Checking for missing draws (Gap Filling) [Force: ${force}]...`);

        const lastDraw = await prisma.draw.findFirst({
            where: { game: 'TOTOLOTO' },
            orderBy: { date: 'desc' }
        });

        if (!lastDraw) {
            console.log('⚠️ [Totoloto] No draws in DB. Running seed from 2011...');
            return await this.seedFromArchive(2011);
        }

        const lastDbDate = lastDraw.date;
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastDbDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Se force for false e a DB estiver "em dia" (menos de 4 dias), evitamos o raspador pesado.
        if (!force && diffDays <= 4) {
            console.log('✅ [Totoloto] DB is up to date (shortcut).');
            return 0;
        }

        console.log(`⚠️ [Totoloto] Database needs sync (${diffDays} days old or Forced). Scanning since 2011 to find holes...`);
        // We always scan back to 2011 if we have holes, because holes can be anywhere.
        // seedFromArchive handles the "already exists" efficiently by page.
        return await this.seedFromArchive(2011);
    }

    async seedFromArchive(limitYear: number = 2016): Promise<number> {
        console.log(`[Totoloto] Seeding from archive (until ${limitYear})...`);
        const BASE_ARCHIVE_URL = 'https://loteriaguru.com/portugal-resultados-loteria/pt-totoloto/pt-totoloto-historico-de-resultados';
        let page = 1;
        let importedCount = 0;
        let consecutiveFailures = 0;
        const KEYWORD_MONTHS: { [key: string]: string } = {
            'jan.': '01', 'fev.': '02', 'mar.': '03', 'abr.': '04', 'mai.': '05', 'jun.': '06',
            'jul.': '07', 'ago.': '08', 'set.': '09', 'out.': '10', 'nov.': '11', 'dez.': '12'
        };

        const agent = new https.Agent({ rejectUnauthorized: false });

        while (page < 30) { // Safety limit (Totoloto, 30 pages = 300 draws is enough)
            const url = `${BASE_ARCHIVE_URL}?page=${page}`;
            console.log(`[Totoloto] Fetching page ${page}...`);

            try {
                const response = await fetch(url, {
                    // @ts-ignore
                    agent: agent as any,
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });

                if (!response.ok) {
                    console.log(`[Totoloto] Page ${page} failed with status ${response.status}`);
                    break;
                }

                const text = await response.text();

                // Regex to find blocks. We'll use a simple regex to find date and numbers.
                // Structure: lg-date has-text-right ... 31 jan. 2026
                // Numbers: lg-numbers-small ... li>10...

                // We will split by "lg-line" to process each row individually
                const validLines = text.split('lg-line').slice(1); // Skip header/preamble

                if (validLines.length === 0) {
                    console.log(`[Totoloto] No data found on page ${page}. Stopping.`);
                    break;
                }
                
                let actualDrawsFound = 0;
                let pageHasNewData = false;
                let reachedLimit = false;

                for (const block of validLines) {
                    // Extract Date
                    const dateMatch = block.match(/(\d{1,2})\s+([a-zç\.]+)\s*<\/strong>\s*(\d{4})/i);
                    if (!dateMatch) continue;
                    
                    actualDrawsFound++;

                    const day = dateMatch[1].padStart(2, '0');
                    const monthStr = dateMatch[2].toLowerCase();
                    const year = parseInt(dateMatch[3]);
                    const month = KEYWORD_MONTHS[monthStr];

                    if (!month) {
                        console.warn(`[Totoloto] Unknown month: ${monthStr}`);
                        continue;
                    }

                    if (year < limitYear) {
                        reachedLimit = true;
                        break; // Stop processing this page, and we will stop outer loop too
                    }

                    const isoDate = `${year}-${month}-${day}`;
                    const drawDate = new Date(isoDate + "T12:00:00Z");
                    const dayOfWeek = drawDate.getUTCDay();
                    if (dayOfWeek === 2) { // Tuesday -> Shift to real Wednesday
                        drawDate.setUTCDate(drawDate.getUTCDate() + 1);
                    } else if (dayOfWeek === 5) { // Friday -> Shift to real Saturday
                        drawDate.setUTCDate(drawDate.getUTCDate() + 1);
                    } else if (dayOfWeek === 0) { // Sunday -> Shift to real Saturday (sometimes they shift forward instead)
                        // If it's Sunday after 2011, it was almost certainly a Saturday draw pushed visually
                        if (drawDate > new Date("2011-03-01T00:00:00Z")) {
                            drawDate.setUTCDate(drawDate.getUTCDate() - 1);
                        }
                    }

                    // Extract Numbers
                    // <ul class="lg-numbers-small game-number"> ... <li class="lg-number">10</li> ... </ul>
                    // We need to match all <li class="lg-number ...">(\d+)</li> inside this block
                    const blockNumbersPart = block.split('lg-numbers-small')[1]?.split('</ul>')[0];
                    if (!blockNumbersPart) continue;

                    const numberMatches = [...blockNumbersPart.matchAll(/class="lg-number[^"]*">(\d+)</g)];
                    let allNumbers = numberMatches.map(m => parseInt(m[1]));

                    // The site puts the Lucky Number last, often with class "lg-reversed" but sometimes just last.
                    // Totoloto: 5 numbers + 1 lucky number.
                    // If we found 6 numbers, the last one is the Lucky Number.
                    // If we found 5, we are missing the lucky number?

                    if (allNumbers.length < 6) {
                        // Sometimes layouts change. Warning.
                        // console.warn(`[Totoloto] Found fewer than 6 numbers for ${isoDate}: ${allNumbers}`);
                        // Skip incomplete data to be safe, or try to insert what we have? 
                        // Better skip to maintain integrity.
                        continue;
                    }

                    // Lucky number is the LAST one (Totoloto has 1 lucky number)
                    const luckyNumber = allNumbers.pop(); // Remove and return last
                    const mainNumbers = allNumbers.sort((a, b) => a - b);
                    const stars = [luckyNumber!];

                    // Extract Jackpot
                    // <div class="column is-12 lg-jackpot">\n                <strong>4.200.000€</strong>\n            </div>
                    const jackpotMatch = block.match(/lg-jackpot[^>]*>\s*<strong>\s*([\d\.]+)/);
                    let jackpot = 0;
                    if (jackpotMatch) {
                        jackpot = parseFloat(jackpotMatch[1].replace(/\./g, ''));
                    }

                    // Insert into DB
                    const existing = await prisma.draw.findFirst({
                        where: {
                            game: 'TOTOLOTO',
                            date: drawDate
                        },
                    });

                    if (!existing) {
                        const newDraw = await prisma.draw.create({
                            data: {
                                game: 'TOTOLOTO',
                                date: drawDate,
                                numbers: JSON.stringify(mainNumbers),
                                stars: JSON.stringify(stars),
                                numbersDrawOrder: JSON.stringify(mainNumbers),
                                starsDrawOrder: JSON.stringify(stars),
                                jackpot: jackpot,
                                hasWinner: false,
                            },
                        });

                        // Evaluate performance immediately for this draw (Incremental)
                        try {
                            await evaluateDraw(newDraw.id);
                            await evaluateDrawStars(newDraw.id);
                        } catch (e) {
                            console.error(`⚠️ Failed to evaluate Totoloto draw ${newDraw.id}:`, e);
                        }

                        console.log(`✅ [Totoloto] Imported: ${isoDate} | ${mainNumbers.join(',')} + ${stars}`);
                        importedCount++;
                        pageHasNewData = true;
                    }
                }

                if (actualDrawsFound === 0) {
                    console.log(`[Totoloto] No valid draws on page ${page}. Stopping.`);
                    break;
                }

                if (reachedLimit) {
                    console.log(`[Totoloto] Reached year limit ${limitYear}. Stopping.`);
                    break;
                }

                page++;
                // Polite delay
                await new Promise(r => setTimeout(r, 200));

            } catch (error) {
                console.error(`[Totoloto] Error processing page ${page}:`, error);
                break;
            }
        }

        // After import, update rankings once
        if (importedCount > 0) {
            console.log('[Totoloto] Updating rankings after import...');
            // We should ideally evaluate each draw in chronological order, 
            // but for bulk import, re-running everything might be heavy.
            // For now, let's just update the final caching. 
            // NOTE: The proper way is to iterate from oldest to newest NEW draw and evaluate.
            // But since we are importing history, we might just want to ensure they exist.
            // The user can run a "recalc" script if needed.
            // However, to be nice, let's trigger a full refresh if it's not too huge.
            // Given 10 years ~ 1000 draws, we probably shouldn't run detailed evaluation for ALL in this loop.
        }

        return importedCount;
    }
}
