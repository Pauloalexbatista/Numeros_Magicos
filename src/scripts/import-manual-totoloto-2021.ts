
import { prisma } from '../lib/prisma';

// 2021 Data (Spanish Format)
const RAW_DATA = `
miércoles
29 dic. 2021	
7 24 38 46 47 9
2.824.618,59 €
sábado
25 dic. 2021	
3 27 29 31 32 9
2.600.000 €
miércoles
22 dic. 2021	
21 35 36 44 49 1
2.400.000 €
sábado
18 dic. 2021	
4 14 26 33 35 1
2.100.000 €
miércoles
15 dic. 2021	
4 28 31 37 49 7
1.900.000 €
sábado
11 dic. 2021	
23 27 32 36 43 7
1.700.000 €
miércoles
8 dic. 2021	
14 19 28 39 44 12
1.400.000 €
sábado
4 dic. 2021	
2 10 19 21 28 6
1.200.000 €
miércoles
1 dic. 2021	
3 10 13 33 49 2
1.000.000 €
noviembre 2021
sábado
27 nov. 2021	
23 25 38 39 46 3
2.216.581,83 €
miércoles
24 nov. 2021	
2 19 37 40 44 3
1.900.000 €
sábado
20 nov. 2021	
6 29 34 40 43 3
1.700.000 €
miércoles
17 nov. 2021	
18 32 43 46 48 12
1.500.000 €
sábado
13 nov. 2021	
12 20 40 41 44 3
1.200.000 €
miércoles
10 nov. 2021	
24 30 34 36 38 8
1.000.000 €
sábado
6 nov. 2021	
3 16 25 33 45 10
7.190.100,21 €
miércoles
3 nov. 2021	
11 18 20 31 42 10
6.700.000 €
octubre 2021
sábado
30 oct. 2021	
10 17 26 28 49 5
6.400.000 €
miércoles
27 oct. 2021	
3 24 28 37 41 2
1.200.000 €
sábado
23 oct. 2021	
12 16 17 32 34 2
1.000.000 €
miércoles
20 oct. 2021	
11 17 25 30 34 8
11.618.854,71 €
sábado
16 oct. 2021	
3 16 24 41 46 12
11.400.000 €
miércoles
13 oct. 2021	
20 26 34 36 42 7
11.100.000 €
sábado
9 oct. 2021	
7 9 23 29 42 12
10.800.000 €
miércoles
6 oct. 2021	
7 10 18 42 43 6
10.600.000 €
sábado
2 oct. 2021	
8 15 26 34 49 1
10.300.000 €
septiembre 2021
miércoles
29 sep. 2021	
5 13 35 37 43 6
10.100.000 €
sábado
25 sep. 2021	
28 31 35 42 46 6
9.900.000 €
miércoles
22 sep. 2021	
11 22 28 30 43 3
9.600.000 €
sábado
18 sep. 2021	
7 23 25 28 37 2
9.400.000 €
miércoles
15 sep. 2021	
4 7 9 29 35 10
9.200.000 €
sábado
11 sep. 2021	
16 17 22 38 46 10
9.000.000 €
miércoles
8 sep. 2021	
10 18 23 28 33 2
8.800.000 €
sábado
4 sep. 2021	
3 6 7 29 36 10
8.500.000 €
miércoles
1 sep. 2021	
4 16 25 32 46 11
8.300.000 €
agosto 2021
sábado
28 ago. 2021	
1 15 25 28 32 6
8.100.000 €
miércoles
25 ago. 2021	
9 28 30 33 49 10
7.800.000 €
sábado
21 ago. 2021	
29 34 36 43 48 1
7.600.000 €
miércoles
18 ago. 2021	
7 13 15 32 39 12
7.400.000 €
sábado
14 ago. 2021	
13 15 16 17 47 4
7.200.000 €
miércoles
11 ago. 2021	
4 5 7 19 22 12
7.000.000 €
sábado
7 ago. 2021	
16 17 21 41 46 6
6.800.000 €
miércoles
4 ago. 2021	
1 18 23 30 32 7
6.500.000 €
julio 2021
sábado
31 jul. 2021	
5 6 10 30 35 5
6.300.000 €
miércoles
28 jul. 2021	
10 33 38 43 46 12
6.100.000 €
sábado
24 jul. 2021	
12 15 22 26 33 11
5.800.000 €
miércoles
21 jul. 2021	
20 25 26 27 28 5
5.700.000 €
sábado
17 jul. 2021	
10 22 25 29 40 6
5.500.000 €
miércoles
14 jul. 2021	
12 25 33 34 40 9
5.300.000 €
sábado
10 jul. 2021	
3 17 34 45 49 10
5.100.000 €
miércoles
7 jul. 2021	
14 18 19 41 46 4
4.900.000 €
sábado
3 jul. 2021	
7 8 22 24 38 9
4.700.000 €
junio 2021
miércoles
30 jun. 2021	
1 14 20 37 42 4
4.500.000 €
sábado
26 jun. 2021	
8 13 32 37 49 1
4.300.000 €
miércoles
23 jun. 2021	
9 28 32 39 49 10
4.000.000 €
sábado
19 jun. 2021	
9 15 23 27 48 6
3.800.000 €
miércoles
16 jun. 2021	
2 18 28 33 39 9
3.600.000 €
sábado
12 jun. 2021	
9 19 24 32 41 8
3.400.000 €
miércoles
9 jun. 2021	
9 13 27 45 47 9
3.200.000 €
sábado
5 jun. 2021	
32 39 46 47 48 3
3.000.000 €
miércoles
2 jun. 2021	
7 9 18 27 47 7
2.800.000 €
mayo 2021
sábado
29 may. 2021	
2 5 20 39 43 3
2.600.000 €
miércoles
26 may. 2021	
3 17 21 22 27 2
2.400.000 €
sábado
22 may. 2021	
2 18 21 22 34 3
2.200.000 €
miércoles
19 may. 2021	
2 10 22 23 44 13
2.000.000 €
sábado
15 may. 2021	
6 24 33 40 41 2
1.800.000 €
miércoles
12 may. 2021	
1 13 35 39 43 3
1.600.000 €
sábado
8 may. 2021	
4 18 23 29 41 8
1.400.000 €
miércoles
5 may. 2021	
6 17 27 32 39 5
1.200.000 €
sábado
1 may. 2021	
16 17 29 35 45 9
1.000.000 €
abril 2021
miércoles
28 abr. 2021	
3 10 14 46 47 11
13.307.245,23 €
sábado
24 abr. 2021	
5 21 28 37 46 12
13.000.000 €
miércoles
21 abr. 2021	
4 5 22 37 48 2
12.800.000 €
sábado
17 abr. 2021	
17 26 28 35 44 12
12.600.000 €
miércoles
14 abr. 2021	
5 15 27 30 37 3
12.300.000 €
sábado
10 abr. 2021	
8 24 26 27 47 10
12.000.000 €
miércoles
7 abr. 2021	
4 19 20 21 22 2
11.700.000 €
sábado
3 abr. 2021	
2 4 16 41 42 12
11.500.000 €
marzo 2021
miércoles
31 mar. 2021	
26 38 42 43 44 7
11.300.000 €
sábado
27 mar. 2021	
18 25 37 43 45 8
11.100.000 €
miércoles
24 mar. 2021	
14 30 31 39 48 8
10.800.000 €
sábado
20 mar. 2021	
5 13 15 26 47 6
10.600.000 €
miércoles
17 mar. 2021	
17 22 24 30 49 9
10.300.000 €
sábado
13 mar. 2021	
14 19 29 37 47 10
10.000.000 €
miércoles
10 mar. 2021	
17 19 22 32 46 10
9.800.000 €
sábado
6 mar. 2021	
10 18 20 29 48 6
9.600.000 €
miércoles
3 mar. 2021	
3 4 21 24 44 10
9.300.000 €
febrero 2021
sábado
27 feb. 2021	
18 29 35 37 41 2
9.100.000 €
miércoles
24 feb. 2021	
21 25 40 44 48 8
8.800.000 €
sábado
20 feb. 2021	
2 28 31 36 45 7
8.600.000 €
miércoles
17 feb. 2021	
8 10 21 36 43 6
8.300.000 €
sábado
13 feb. 2021	
11 12 24 36 38 8
8.100.000 €
miércoles
10 feb. 2021	
12 40 42 47 48 3
7.900.000 €
sábado
6 feb. 2021	
3 10 24 25 41 4
7.700.000 €
miércoles
3 feb. 2021	
18 19 23 27 47 3
7.400.000 €
enero 2021
sábado
30 ene. 2021	
11 20 22 30 42 12
7.200.000 €
miércoles
27 ene. 2021	
10 26 29 31 42 10
7.000.000 €
sábado
23 ene. 2021	
33 43 44 47 49 11
6.800.000 €
miércoles
20 ene. 2021	
14 19 28 31 40 9
6.600.000 €
sábado
16 ene. 2021	
4 20 30 35 46 9
6.400.000 €
miércoles
13 ene. 2021	
8 11 16 43 47 13
6.200.000 €
sábado
9 ene. 2021	
18 22 25 29 33 7
5.900.000 €
miércoles
6 ene. 2021	
4 29 35 46 47 10
5.700.000 €
sábado
2 ene. 2021	
19 21 31 34 40 5
5.500.000 €
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
    console.log("Parsing & Importing Manual Totoloto data (2021 - Spanish Format)...");

    // Split into lines
    const lines = RAW_DATA.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentDate: Date | null = null;
    let importedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match date: "31 dic. 2021" or "1 ene. 2021"
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

    console.log(`\nDone. Imported ${importedCount} Totoloto draws from 2021.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
