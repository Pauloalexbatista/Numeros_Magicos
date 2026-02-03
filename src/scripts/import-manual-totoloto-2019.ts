
import { prisma } from '../lib/prisma';

// 2019 Data (Spanish Format)
const RAW_DATA = `
diciembre 2019
sábado
28 dic. 2019	
1 8 22 38 43 7
9.200.000 €
miércoles
25 dic. 2019	
16 26 39 42 44 2
9.000.000 €
sábado
21 dic. 2019	
1 20 24 44 48 13
8.700.000 €
miércoles
18 dic. 2019	
3 5 6 26 44 6
8.500.000 €
sábado
14 dic. 2019	
1 7 11 12 44 12
8.300.000 €
miércoles
11 dic. 2019	
7 13 24 43 47 9
8.100.000 €
sábado
7 dic. 2019	
6 15 26 32 41 1
7.900.000 €
miércoles
4 dic. 2019	
17 31 35 39 42 13
7.700.000 €
noviembre 2019
sábado
30 nov. 2019	
12 26 43 44 46 2
7.500.000 €
miércoles
27 nov. 2019	
1 4 9 16 21 11
7.300.000 €
sábado
23 nov. 2019	
1 5 12 16 36 11
7.100.000 €
miércoles
20 nov. 2019	
5 8 11 38 42 2
6.900.000 €
sábado
16 nov. 2019	
14 26 38 42 48 11
6.700.000 €
miércoles
13 nov. 2019	
16 27 41 46 48 5
6.500.000 €
sábado
9 nov. 2019	
10 23 28 41 48 11
6.300.000 €
miércoles
6 nov. 2019	
13 24 32 35 46 6
6.100.000 €
sábado
2 nov. 2019	
8 13 14 27 39 9
5.900.000 €
octubre 2019
miércoles
30 oct. 2019	
4 20 24 28 29 6
5.700.000 €
sábado
26 oct. 2019	
5 18 34 35 45 5
5.500.000 €
miércoles
23 oct. 2019	
16 42 46 48 49 9
5.300.000 €
sábado
19 oct. 2019	
4 10 16 17 33 8
5.100.000 €
miércoles
16 oct. 2019	
2 13 14 24 46 9
4.800.000 €
sábado
12 oct. 2019	
9 11 25 38 41 4
4.600.000 €
miércoles
9 oct. 2019	
21 24 25 43 46 10
4.300.000 €
sábado
5 oct. 2019	
15 20 25 29 33 4
4.200.000 €
miércoles
2 oct. 2019	
8 9 17 23 37 8
4.000.000 €
septiembre 2019
sábado
28 sep. 2019	
6 10 15 18 44 8
3.800.000 €
miércoles
25 sep. 2019	
2 20 27 37 49 4
3.600.000 €
sábado
21 sep. 2019	
13 14 16 26 36 4
3.400.000 €
miércoles
18 sep. 2019	
12 19 21 23 30 1
3.200.000 €
sábado
14 sep. 2019	
2 4 16 21 40 7
3.000.000 €
miércoles
11 sep. 2019	
12 17 18 24 27 6
2.900.000 €
sábado
7 sep. 2019	
6 18 27 48 49 1
2.700.000 €
miércoles
4 sep. 2019	
15 22 24 27 41 4
2.500.000 €
agosto 2019
sábado
31 ago. 2019	
8 21 33 38 39 11
2.300.000 €
miércoles
28 ago. 2019	
13 21 35 47 49 4
2.100.000 €
sábado
24 ago. 2019	
4 10 14 23 46 4
1.900.000 €
miércoles
21 ago. 2019	
11 18 34 40 43 3
1.700.000 €
sábado
17 ago. 2019	
10 25 32 36 40 1
1.500.000 €
miércoles
14 ago. 2019	
6 23 31 40 47 8
1.300.000 €
sábado
10 ago. 2019	
2 12 29 36 44 5
1.200.000 €
miércoles
7 ago. 2019	
6 7 19 43 47 12
536.895,66 €
sábado
3 ago. 2019	
5 13 29 30 47 4
5.532.547,81 €
julio 2019
miércoles
31 jul. 2019	
17 26 30 37 42 13
5.300.000 €
sábado
27 jul. 2019	
6 20 38 45 49 13
5.100.000 €
miércoles
24 jul. 2019	
2 6 22 33 38 12
4.900.000 €
sábado
20 jul. 2019	
5 11 15 16 23 10
4.700.000 €
miércoles
17 jul. 2019	
4 15 26 32 38 8
4.500.000 €
sábado
13 jul. 2019	
11 18 19 22 36 11
4.300.000 €
miércoles
10 jul. 2019	
23 26 41 43 47 10
4.100.000 €
sábado
6 jul. 2019	
18 20 24 37 47 8
3.900.000 €
miércoles
3 jul. 2019	
7 26 32 41 46 3
3.700.000 €
junio 2019
sábado
29 jun. 2019	
8 16 20 41 43 2
3.500.000 €
miércoles
26 jun. 2019	
4 11 14 21 41 11
3.300.000 €
sábado
22 jun. 2019	
32 34 38 39 43 5
3.200.000 €
miércoles
19 jun. 2019	
2 9 13 23 25 4
3.000.000 €
sábado
15 jun. 2019	
9 10 39 42 46 8
2.800.000 €
miércoles
12 jun. 2019	
8 17 33 38 46 5
2.600.000 €
sábado
8 jun. 2019	
9 23 30 37 38 10
2.400.000 €
miércoles
5 jun. 2019	
2 4 8 19 25 9
2.200.000 €
sábado
1 jun. 2019	
24 25 26 35 43 10
2.000.000 €
mayo 2019
miércoles
29 may. 2019	
3 20 33 38 49 9
1.800.000 €
sábado
25 may. 2019	
13 26 32 36 45 13
1.700.000 €
miércoles
22 may. 2019	
8 29 35 45 47 7
1.500.000 €
sábado
18 may. 2019	
18 19 22 28 39 2
1.300.000 €
miércoles
15 may. 2019	
11 13 20 32 44 13
1.100.000 €
sábado
11 may. 2019	
10 24 29 33 40 5
412.626,11 €
miércoles
8 may. 2019	
6 21 33 36 41 8
1.520.043,02 €
sábado
4 may. 2019	
1 17 38 40 45 6
1.300.000 €
miércoles
1 may. 2019	
10 11 24 28 34 10
1.100.000 €
abril 2019
sábado
27 abr. 2019	
8 10 30 46 47 9
441.263,74 €
miércoles
24 abr. 2019	
5 23 26 34 42 4
6.340.769,09 €
sábado
20 abr. 2019	
3 7 36 42 43 9
6.000.000 €
miércoles
17 abr. 2019	
7 9 14 21 39 9
5.900.000 €
sábado
13 abr. 2019	
6 11 13 25 32 2
5.700.000 €
miércoles
10 abr. 2019	
12 23 33 37 42 7
5.500.000 €
sábado
6 abr. 2019	
5 8 30 31 38 8
5.300.000 €
miércoles
3 abr. 2019	
11 37 42 43 45 4
5.100.000 €
marzo 2019
sábado
30 mar. 2019	
27 36 38 43 49 8
5.000.000 €
miércoles
27 mar. 2019	
7 13 27 36 43 9
4.700.000 €
sábado
23 mar. 2019	
16 39 40 45 49 6
4.600.000 €
miércoles
20 mar. 2019	
9 15 17 18 34 9
4.400.000 €
sábado
16 mar. 2019	
26 31 32 36 43 13
4.200.000 €
miércoles
13 mar. 2019	
6 16 17 25 32 13
4.000.000 €
sábado
9 mar. 2019	
1 8 11 17 39 9
3.800.000 €
miércoles
6 mar. 2019	
4 39 42 46 48 6
3.600.000 €
sábado
2 mar. 2019	
13 28 32 39 48 6
3.400.000 €
febrero 2019
miércoles
27 feb. 2019	
2 13 24 29 37 2
3.200.000 €
sábado
23 feb. 2019	
12 31 34 36 46 3
3.000.000 €
miércoles
20 feb. 2019	
8 19 26 28 36 1
2.800.000 €
sábado
16 feb. 2019	
2 4 7 18 40 1
2.600.000 €
miércoles
13 feb. 2019	
4 6 7 40 47 13
2.400.000 €
sábado
9 feb. 2019	
5 26 28 32 33 6
2.200.000 €
miércoles
6 feb. 2019	
5 36 43 46 47 9
2.000.000 €
sábado
2 feb. 2019	
10 15 29 41 44 2
1.900.000 €
enero 2019
miércoles
30 ene. 2019	
4 17 33 37 39 1
1.700.000 €
sábado
26 ene. 2019	
3 14 29 47 48 4
1.500.000 €
miércoles
23 ene. 2019	
8 21 33 44 45 5
1.300.000 €
sábado
19 ene. 2019	
31 36 37 40 43 7
1.200.000 €
miércoles
16 ene. 2019	
3 9 16 24 47 3
507.563,94 €
sábado
12 ene. 2019	
1 15 28 35 45 13
1.583.932,57 €
miércoles
9 ene. 2019	
28 34 36 46 48 7
1.300.000 €
sábado
5 ene. 2019	
19 31 40 42 48 9
1.200.000 €
miércoles
2 ene. 2019	
4 16 25 35 48 2
1.000.000 €
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
    console.log("Parsing & Importing Manual Totoloto data (2019 - Spanish Format)...");

    // Split into lines
    const lines = RAW_DATA.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentDate: Date | null = null;
    let importedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match date: "31 dic. 2019" or "1 ene. 2019"
        const dateMatch = line.match(/^(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.?\s+(\d{4})/);

        if (dateMatch) {
            const day = dateMatch[1].padStart(2, '0');
            const monthStr = dateMatch[2];
            const year = dateMatch[3];
            const month = MONTH_MAP[monthStr];

            if (month) {
                // Noon UTC
                currentDate = new Date(`${year}-${month}-${day}T12:00:00Z`);

                // Usually the next line has numbers: "2 3 22 31 49 3"
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

    console.log(`\nDone. Imported ${importedCount} Totoloto draws from 2019.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
