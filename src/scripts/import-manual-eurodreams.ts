
import { prisma } from '../lib/prisma';

const RAW_DATA = `
December 2023
Thursday 28th December 2023	
5 11 15 21 24 39 5
Monday 25th December 2023	
3 12 13 17 21 22 1
Thursday 21st December 2023	
3 15 17 23 26 29 4
Monday 18th December 2023	
2 16 21 33 35 40 5
Thursday 14th December 2023	
3 8 9 22 27 33 1
Monday 11th December 2023	
11 18 21 28 30 32 1
Thursday 7th December 2023	
1 3 5 10 32 38 5
Monday 4th December 2023	
8 12 24 29 30 32 5

November 2023
Thursday 30th November 2023	
2 14 15 27 36 37 5
Monday 27th November 2023	
2 18 23 29 33 35 4
Thursday 23rd November 2023	
4 15 22 23 28 35 4
Monday 20th November 2023	
6 13 18 25 26 32 3
Thursday 16th November 2023	
5 11 13 18 25 27 5
Monday 13th November 2023	
1 6 25 26 33 39 2
Thursday 9th November 2023	
14 16 19 31 32 37 2
Monday 6th November 2023	
10 13 14 25 30 35 5
`;

const MONTHS: Record<string, string> = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
    'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
};

async function parseAndImport() {
    console.log("Parsing & Importing Manual EuroDreams data (2023)...");

    const lines = RAW_DATA.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentDate: Date | null = null;
    let importedCount = 0;
    let errorCount = 0;

    for (const line of lines) {
        const cleanLine = line.replace(/\s+/g, ' ');

        const dateMatch = cleanLine.match(/^[a-zA-Z]+ (\d+)(st|nd|rd|th)? ([a-zA-Z]+) (\d{4})$/);

        if (dateMatch) {
            const day = dateMatch[1].padStart(2, '0');
            const monthName = dateMatch[3];
            const year = dateMatch[4];
            const month = MONTHS[monthName];

            if (month) {
                currentDate = new Date(`${year}-${month}-${day}T12:00:00Z`);
            }
            continue;
        }

        if (currentDate && /^\d+/.test(cleanLine)) {
            const nums = cleanLine.split(' ').map(n => parseInt(n));

            if (nums.length === 7) {
                const mainNumbers = nums.slice(0, 6).sort((a, b) => a - b);
                const dreamNumber = nums[6];

                try {
                    const startOfDay = new Date(currentDate); startOfDay.setUTCHours(0, 0, 0, 0);
                    const endOfDay = new Date(currentDate); endOfDay.setUTCHours(23, 59, 59, 999);

                    const exists = await prisma.draw.findFirst({
                        where: {
                            game: 'EURODREAMS',
                            date: {
                                gte: startOfDay,
                                lte: endOfDay
                            }
                        }
                    });

                    if (!exists) {
                        await prisma.draw.create({
                            data: {
                                game: 'EURODREAMS',
                                date: currentDate,
                                numbers: JSON.stringify(mainNumbers),
                                stars: JSON.stringify([dreamNumber]),
                            }
                        });
                        console.log(`Imported: ${currentDate.toISOString().split('T')[0]} -> ${mainNumbers.join(',')} + ${dreamNumber}`);
                        importedCount++;
                    }
                } catch (e) {
                    console.error(`Error importing ${currentDate.toISOString()}:`, e);
                    errorCount++;
                }
            }
            currentDate = null;
        }
    }

    console.log(`\nDone! Imported ${importedCount} draws. Errors: ${errorCount}`);
}

parseAndImport()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
