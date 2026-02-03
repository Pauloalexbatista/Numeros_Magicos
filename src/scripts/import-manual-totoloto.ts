
import { prisma } from '../lib/prisma';

// November & December 2023 Data
const RAW_DATA = `
Totoloto 1 novembro 2023 (01/11/2023) 87/2023
11	29	37	39	42		1
Prémios 01/11/2023

Totoloto 4 novembro 2023 (04/11/2023) 88/2023
23	29	32	33	37		10
Prémios 04/11/2023

Totoloto 8 novembro 2023 (08/11/2023) 89/2023
18	32	33	43	45		1
Prémios 08/11/2023

Totoloto 11 novembro 2023 (11/11/2023) 90/2023
15	21	38	39	41		5
Prémios 11/11/2023

Totoloto 15 novembro 2023 (15/11/2023) 91/2023
2	15	20	22	41		9
Prémios 15/11/2023

Totoloto 18 novembro 2023 (18/11/2023) 92/2023
7	20	30	43	45		6
Prémios 18/11/2023

Totoloto 22 novembro 2023 (22/11/2023) 93/2023
4	11	22	25	29		2
Prémios 22/11/2023

Totoloto 25 novembro 2023 (25/11/2023) 94/2023
5	16	38	43	45		10
Prémios 25/11/2023

Totoloto 29 novembro 2023 (29/11/2023) 95/2023
7	12	26	32	33		10

Totoloto 2 dezembro 2023 (02/12/2023) 96/2023
7	33	35	37	42		13
Prémios 02/12/2023

Totoloto 6 dezembro 2023 (06/12/2023) 97/2023
9	13	25	41	46		13
Prémios 06/12/2023

Totoloto 9 dezembro 2023 (09/12/2023) 98/2023
22	24	30	33	39		1
Prémios 09/12/2023

Totoloto 13 dezembro 2023 (13/12/2023) 99/2023
23	25	26	41	45		7
Prémios 13/12/2023

Totoloto 16 dezembro 2023 (16/12/2023) 100/2023
8	13	18	31	43		8
Prémios 16/12/2023

Totoloto 20 dezembro 2023 (20/12/2023) 101/2023
3	8	10	25	31		1
Prémios 20/12/2023

Totoloto 23 dezembro 2023 (23/12/2023) 102/2023
8	11	22	23	45		9
Prémios 23/12/2023

Totoloto 27 dezembro 2023 (27/12/2023) 103/2023
6	15	16	20	45		6
Prémios 27/12/2023

Totoloto 30 dezembro 2023 (30/12/2023) 104/2023
10	25	29	34	36		11
`;

async function main() {
    console.log("Parsing & Importing Manual Totoloto data (Nov/Dec 2023)...");

    // Split into lines
    const lines = RAW_DATA.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentDate: Date | null = null;
    let importedCount = 0;

    for (const line of lines) {
        // 1. Try to find date in format (03/01/2024)
        const dateMatch = line.match(/\((\d{2})\/(\d{2})\/(\d{4})\)/);
        if (dateMatch) {
            const day = dateMatch[1];
            const month = dateMatch[2];
            const year = dateMatch[3];
            // Store as noon UTC
            currentDate = new Date(`${year}-${month}-${day}T12:00:00Z`);
            continue;
        }

        // 2. If we have a date, look for numbers
        if (currentDate) {
            const nums = line.match(/\d+/g);

            if (nums && nums.length >= 6) {
                const integers = nums.map(n => parseInt(n));

                if (integers.length >= 6) {
                    const mainNumbers = integers.slice(0, 5).sort((a, b) => a - b);
                    const luckyNumber = integers[5];

                    // Import
                    const startOfDay = new Date(currentDate); startOfDay.setUTCHours(0, 0, 0, 0);
                    const endOfDay = new Date(currentDate); endOfDay.setUTCHours(23, 59, 59, 999);

                    const exists = await prisma.draw.findFirst({
                        where: {
                            game: 'TOTOLOTO',
                            date: {
                                gte: startOfDay,
                                lte: endOfDay
                            }
                        }
                    });

                    if (!exists) {
                        try {
                            await prisma.draw.create({
                                data: {
                                    game: 'TOTOLOTO',
                                    date: currentDate,
                                    numbers: JSON.stringify(mainNumbers),
                                    stars: JSON.stringify([luckyNumber]),
                                }
                            });
                            console.log(`Imported: ${currentDate.toISOString().split('T')[0]} -> ${mainNumbers.join(',')} + ${luckyNumber}`);
                            importedCount++;
                        } catch (e) {
                            console.error(`Failed to import ${currentDate}:`, e);
                        }
                    } else {
                        // console.log(`Skipped (Exists): ${currentDate}`);
                    }

                    currentDate = null;
                }
            }
        }
    }

    console.log(`\nDone. Imported ${importedCount} Totoloto draws.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
