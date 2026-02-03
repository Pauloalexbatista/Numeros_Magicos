
import { prisma } from '../lib/prisma';

// 2017 Data (Spanish Format)
const RAW_DATA = `
diciembre 2017
sábado
30 dic. 2017	
4 26 34 37 39 3
miércoles
27 dic. 2017	
18 31 32 33 48 4
sábado
23 dic. 2017	
1 11 16 32 34 2
miércoles
20 dic. 2017	
8 11 31 34 36 1
sábado
16 dic. 2017	
9 23 32 37 48 13
miércoles
13 dic. 2017	
2 4 12 23 32 7
sábado
9 dic. 2017	
2 5 13 23 47 2
miércoles
6 dic. 2017	
8 28 29 39 45 3
sábado
2 dic. 2017	
4 5 31 37 42 12
noviembre 2017
miércoles
29 nov. 2017	
13 31 43 44 46 4
sábado
25 nov. 2017	
11 32 34 37 39 8
miércoles
22 nov. 2017	
3 25 26 41 44 8
sábado
18 nov. 2017	
2 10 39 42 45 12
miércoles
15 nov. 2017	
17 22 26 42 46 3
sábado
11 nov. 2017	
2 12 17 20 23 6
miércoles
8 nov. 2017	
8 10 13 15 46 9
sábado
4 nov. 2017	
8 15 18 35 36 4
miércoles
1 nov. 2017	
4 6 10 32 41 13
octubre 2017
sábado
28 oct. 2017	
2 4 13 22 26 6
miércoles
25 oct. 2017	
11 17 19 21 35 10
sábado
21 oct. 2017	
17 29 32 38 39 1
miércoles
18 oct. 2017	
12 19 22 23 36 2
sábado
14 oct. 2017	
3 6 10 19 30 11
miércoles
11 oct. 2017	
4 10 12 21 45 10
sábado
7 oct. 2017	
12 13 16 27 38 1
miércoles
4 oct. 2017	
13 15 28 44 46 6
septiembre 2017
sábado
30 sep. 2017	
4 6 7 16 40 13
miércoles
27 sep. 2017	
2 31 38 40 41 7
sábado
23 sep. 2017	
7 9 13 21 39 8
miércoles
20 sep. 2017	
13 24 28 32 36 12
sábado
16 sep. 2017	
5 16 31 43 44 13
miércoles
13 sep. 2017	
3 4 14 20 44 12
sábado
9 sep. 2017	
5 9 13 19 48 13
miércoles
6 sep. 2017	
2 9 30 34 49 12
sábado
2 sep. 2017	
21 32 33 39 46 1
agosto 2017
miércoles
30 ago. 2017	
22 23 30 39 44 5
sábado
26 ago. 2017	
6 9 19 37 45 3
miércoles
23 ago. 2017	
13 24 41 43 45 13
sábado
19 ago. 2017	
13 14 20 23 25 5
miércoles
16 ago. 2017	
4 28 31 32 46 3
sábado
12 ago. 2017	
7 35 43 45 47 9
miércoles
9 ago. 2017	
19 29 37 47 48 6
sábado
5 ago. 2017	
6 14 23 24 49 7
miércoles
2 ago. 2017	
9 16 23 28 40 5
julio 2017
sábado
29 jul. 2017	
12 17 35 47 49 13
miércoles
26 jul. 2017	
11 15 17 26 31 13
sábado
22 jul. 2017	
10 15 28 46 47 6
miércoles
19 jul. 2017	
21 29 44 47 49 11
sábado
15 jul. 2017	
11 23 24 34 44 12
miércoles
12 jul. 2017	
9 17 28 32 46 10
sábado
8 jul. 2017	
5 17 24 26 39 11
miércoles
5 jul. 2017	
13 20 23 35 44 11
sábado
1 jul. 2017	
5 13 14 21 28 4
junio 2017
miércoles
28 jun. 2017	
2 4 38 39 46 2
sábado
24 jun. 2017	
6 20 26 35 45 6
miércoles
21 jun. 2017	
2 18 25 41 42 6
sábado
17 jun. 2017	
2 11 25 31 45 2
miércoles
14 jun. 2017	
5 25 33 36 49 11
sábado
10 jun. 2017	
20 35 42 43 47 6
miércoles
7 jun. 2017	
6 17 18 31 40 2
sábado
3 jun. 2017	
6 22 42 45 46 12
mayo 2017
miércoles
31 may. 2017	
18 25 32 34 48 6
sábado
27 may. 2017	
8 24 27 45 47 11
miércoles
24 may. 2017	
3 9 10 22 40 9
sábado
20 may. 2017	
4 15 38 41 46 13
miércoles
17 may. 2017	
6 7 14 28 30 5
sábado
13 may. 2017	
7 21 42 45 48 5
miércoles
10 may. 2017	
11 15 32 39 46 11
sábado
6 may. 2017	
13 19 24 42 47 5
miércoles
3 may. 2017	
2 7 9 15 40 10
abril 2017
sábado
29 abr. 2017	
14 32 40 46 49 6
miércoles
26 abr. 2017	
6 8 16 39 46 9
sábado
22 abr. 2017	
8 14 20 46 48 10
miércoles
19 abr. 2017	
8 13 24 39 44 1
sábado
15 abr. 2017	
2 19 37 38 44 8
miércoles
12 abr. 2017	
1 3 6 37 42 3
sábado
8 abr. 2017	
36 40 42 44 48 3
miércoles
5 abr. 2017	
7 8 36 45 48 2
sábado
1 abr. 2017	
4 5 10 13 37 7
marzo 2017
miércoles
29 mar. 2017	
10 11 15 32 41 11
sábado
25 mar. 2017	
5 12 18 20 43 3
miércoles
22 mar. 2017	
14 30 35 44 47 10
sábado
18 mar. 2017	
8 24 25 41 47 9
miércoles
15 mar. 2017	
7 8 25 27 46 2
sábado
11 mar. 2017	
13 26 29 30 35 9
miércoles
8 mar. 2017	
11 23 33 39 42 7
sábado
4 mar. 2017	
2 4 14 37 43 3
miércoles
1 mar. 2017	
3 13 15 19 25 3
febrero 2017
sábado
25 feb. 2017	
5 8 22 29 41 2
miércoles
22 feb. 2017	
1 2 5 8 43 8
domingo
19 feb. 2017	
17 26 30 41 46 5
miércoles
15 feb. 2017	
14 15 29 39 6
sábado
11 feb. 2017	
10 18 27 30 31 10
miércoles
8 feb. 2017	
2 20 22 42 46 1
sábado
4 feb. 2017	
18 30 34 39 49 10
miércoles
1 feb. 2017	
5 24 25 32 33 12
enero 2017
sábado
28 ene. 2017	
1 6 24 27 33 12
miércoles
25 ene. 2017	
4 18 42 46 48 1
sábado
21 ene. 2017	
12 17 20 27 38 13
miércoles
18 ene. 2017	
7 16 32 38 42 10
sábado
14 ene. 2017	
1 8 10 30 46 1
miércoles
11 ene. 2017	
4 5 8 36 41 9
sábado
7 ene. 2017	
15 21 29 32 33 3
miércoles
4 ene. 2017	
6 9 14 37 49 7
`;

// Helper for simplified spanish months
const MONTH_MAP: { [key: string]: string } = {
    'ene': '01',
    'feb': '02',
    'mar': '03',
    'abr': '04',
    'may': '05',
    'jun': '06',
    'jul': '07',
    'ago': '08',
    'sep': '09',
    'oct': '10',
    'nov': '11',
    'dic': '12'
};

async function main() {
    console.log("Parsing & Importing Manual Totoloto data (2017 - Spanish Format)...");

    // Split into lines
    const lines = RAW_DATA.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentDate: Date | null = null;
    let importedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match date: "30 dic. 2017" or "4 ene. 2017"
        const dateMatch = line.match(/^(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.?\s+(\d{4})/);

        if (dateMatch) {
            const day = dateMatch[1].padStart(2, '0');
            const monthStr = dateMatch[2];
            const year = dateMatch[3];
            const month = MONTH_MAP[monthStr];

            if (month) {
                // Noon UTC
                currentDate = new Date(`${year}-${month}-${day}T12:00:00Z`);

                // Usually the next line has numbers: "4 26 34 37 39 3"
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1];
                    const nums = nextLine.match(/\d+/g);

                    if (nums && nums.length >= 6) {
                        const integers = nums.map(n => parseInt(n));

                        // Parse main numbers and lucky number
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
                    }
                }
            }
        }
    }

    console.log(`\nDone. Imported ${importedCount} Totoloto draws from 2017.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
