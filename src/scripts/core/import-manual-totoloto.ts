
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { backfillRankings } from '@/services/ranking';
import { updateRanking } from '@/services/ranking';

const FILES = [
    'totoloto-raw-part1.txt',
    'totoloto-raw-part2.txt',
    'totoloto-raw-part3.txt'
];

async function parseAndImport() {
    console.log('🚀 Starting Manual Totoloto Import...');
    let totalImported = 0;

    for (const file of FILES) {
        const filePath = path.join(process.cwd(), 'src/scripts/core', file);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ File not found: ${file}`);
            continue;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim().length > 0);

        console.log(`📂 Processing ${file} (${lines.length} lines)...`);

        for (const line of lines) {
            // Updated Regex to handle various formats found in the dump
            // Examples:
            // Sorteio: 045/2011 - Sábado 09/07/2011 - Chave: 3 22 32 33 44 + 11
            // SORTEIO: 001/2013 - QUARTA-FEIRA - 02/01/2013 - CHAVE: 22 - 27 - 37 - 42 - 49 + 13
            // Sorteio: 095/2011 - Sábado 31/12/2011 - Chave: 7 - 13 - 19 - 20 - 31 + 3
            // Handle optional dashes between numbers

            // Normalize line: remove excessive spaces, uppercase
            const normalized = line.toUpperCase().replace(/\s+/g, ' ').replace(/–/g, '-');

            // Regex Breakdown:
            // Sorteio:\s*(\d+)/(\d+)  -> Capture Draw ID and Year
            // .*?(\d{2}/\d{2}/\d{4})  -> Capture Date
            // .*?CHAVE:\s*([\d\s-]+)\+\s*(\d+) -> Capture Numbers (maybe with dashes) and Star

            const match = normalized.match(/SORTEIO:\s*(\d+)\/(\d+).*?(\d{2}\/\d{2}\/\d{4}).*?CHAVE:\s*([0-9\s-]+)\+\s*(\d+)/);

            if (match) {
                const drawNumber = parseInt(match[1]);
                const year = parseInt(match[2]);
                const dateStr = match[3];
                const numbersRaw = match[4];
                const starRaw = match[5];

                // Parse Date (DD/MM/YYYY)
                const [day, month, yearDt] = dateStr.split('/').map(Number);
                const date = new Date(yearDt, month - 1, day);

                // Parse Numbers: remove dashes, split by space
                const numbers = numbersRaw
                    .replace(/-/g, ' ')
                    .split(' ')
                    .map(n => parseInt(n.trim()))
                    .filter(n => !isNaN(n));

                const stars = [parseInt(starRaw)];

                if (numbers.length !== 5) {
                    console.warn(`⚠️ Invalid numbers count for ${drawNumber}/${year}: ${numbers.join(',')}`);
                    continue;
                }

                // Calculate numeric ID (e.g. 2011045)
                // However, system uses auto-increment. We should probably just rely on date or create a synthetic ID logic if needed.
                // But wait, the existing scraper uses auto-increment ID in DB.
                // We should check if draw exists by Date.

                const existing = await prisma.draw.findFirst({
                    where: {
                        game: 'TOTOLOTO',
                        date: date
                    }
                });

                if (!existing) {
                    try {
                        const payload = {
                            game: 'TOTOLOTO',
                            sequenceNumber: year * 1000 + drawNumber,
                            date: date,
                            numbers: JSON.stringify(numbers),
                            stars: JSON.stringify(stars),
                            numbersDrawOrder: JSON.stringify(numbers),
                            starsDrawOrder: JSON.stringify(stars),
                            hasWinner: false,
                            jackpot: 0
                        };
                        // console.log('Inserting:', payload); // Uncomment if needed
                        await prisma.draw.create({ data: payload });
                        totalImported++;
                        process.stdout.write('.');
                    } catch (e) {
                        console.error(`\n❌ Failed to insert Draw ${drawNumber}/${year}:`, e);
                    }
                }
            }
        }
        console.log('\n');
    }

    console.log(`✅ Imported ${totalImported} new draws.`);

    // Trigger Backfill if needed
    if (totalImported > 0) {
        console.log('🔄 Triggering backfill...');
        // We can use 2011 as start year for backfill logic, but backfillRankings takes a number of draws to look back.
        // Or we can just run the standard backfill for everything?
        // Let's call backfillRankings but maybe we need a dedicated "recalc all" logic?
        // standard backfillRankings usually does last N draws.
        // Actually, seed-totoloto.ts calls `backfillRankings(50)`.
        // We probably want to process ALL imported draws.

        // Let's implement a custom loop here since we imported old data.
        const allDraws = await prisma.draw.findMany({
            where: { game: 'TOTOLOTO' },
            orderBy: { date: 'asc' }
        });

        console.log(`Processing ${allDraws.length} total draws for ranking updates...`);
        // We can rely on the existing batch processor if I import it, but `backfillRankings` is limited.
        // Let's just call `backfillRankings` with a large number (e.g. 1000) or modify it.
        // For safety, I'll use the service function but pass a large limit.

        await backfillRankings(2000); // Should cover all history
    }
}

parseAndImport()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
