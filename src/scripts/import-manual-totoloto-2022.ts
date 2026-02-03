
import { prisma } from '../lib/prisma';

// 2022 Data (Spanish Format)
const RAW_DATA = `
diciembre 2022
sábado
31 dic. 2022	
2 3 22 31 49 3
15.100.000 €
miércoles
28 dic. 2022	
6 15 25 28 35 5
14.800.000 €
sábado
24 dic. 2022	
1 25 31 44 48 11
14.500.000 €
miércoles
21 dic. 2022	
12 13 24 30 46 12
14.300.000 €
sábado
17 dic. 2022	
2 9 18 23 30 2
14.000.000 €
miércoles
14 dic. 2022	
26 33 34 39 44 6
13.700.000 €
sábado
10 dic. 2022	
21 36 38 39 44 7
13.400.000 €
miércoles
7 dic. 2022	
9 31 34 37 49 4
13.100.000 €
sábado
3 dic. 2022	
17 21 23 34 38 7
12.900.000 €
noviembre 2022
miércoles
30 nov. 2022	
6 23 39 40 41 5
12.600.000 €
sábado
26 nov. 2022	
4 14 16 22 39 7
12.400.000 €
miércoles
23 nov. 2022	
18 20 25 26 45 8
12.200.000 €
sábado
19 nov. 2022	
8 10 25 26 28 1
11.900.000 €
miércoles
16 nov. 2022	
4 16 22 26 35 4
11.600.000 €
sábado
12 nov. 2022	
3 13 20 33 36 13
11.300.000 €
miércoles
9 nov. 2022	
17 28 36 41 42 9
5.900.000 €
sábado
5 nov. 2022	
3 25 28 32 43 1
5.700.000 €
miércoles
2 nov. 2022	
3 14 27 33 39 12
5.500.000 €
octubre 2022
sábado
29 oct. 2022	
1 10 15 28 44 12
5.200.000 €
miércoles
26 oct. 2022	
19 30 37 39 47 4
5.000.000 €
sábado
22 oct. 2022	
8 18 25 29 32 10
4.800.000 €
miércoles
19 oct. 2022	
10 15 19 36 46 4
4.500.000 €
sábado
15 oct. 2022	
3 15 21 29 35 11
4.300.000 €
miércoles
12 oct. 2022	
2 19 22 30 35 8
4.000.000 €
sábado
8 oct. 2022	
13 20 26 29 46 5
3.800.000 €
miércoles
5 oct. 2022	
2 4 11 34 37 8
3.600.000 €
sábado
1 oct. 2022	
23 42 43 45 49 10
3.400.000 €
septiembre 2022
miércoles
28 sep. 2022	
4 7 16 30 42 6
3.200.000 €
sábado
24 sep. 2022	
7 10 15 29 43 1
3.000.000 €
miércoles
21 sep. 2022	
1 10 23 28 35 1
2.700.000 €
sábado
17 sep. 2022	
3 11 37 41 46 2
2.500.000 €
miércoles
14 sep. 2022	
2 4 37 42 46 10
2.300.000 €
sábado
10 sep. 2022	
2 6 7 20 39 1
2.000.000 €
miércoles
7 sep. 2022	
5 12 13 29 37 2
1.800.000 €
sábado
3 sep. 2022	
9 29 41 42 49 13
1.600.000 €
agosto 2022
miércoles
31 ago. 2022	
5 14 25 30 34 4
1.400.000 €
sábado
27 ago. 2022	
15 27 37 43 48 5
1.200.000 €
miércoles
24 ago. 2022	
19 20 30 40 42 6
1.000.000 €
sábado
20 ago. 2022	
11 13 18 28 33 12
6.315.185,16 €
miércoles
17 ago. 2022	
22 36 38 44 48 12
6.000.000 €
sábado
13 ago. 2022	
3 8 11 39 47 12
5.800.000 €
miércoles
10 ago. 2022	
4 8 24 39 46 4
5.500.000 €
sábado
6 ago. 2022	
8 12 27 35 38 6
5.300.000 €
miércoles
3 ago. 2022	
24 32 33 38 41 10
5.100.000 €
julio 2022
sábado
30 jul. 2022	
3 9 22 27 37 7
4.800.000 €
miércoles
27 jul. 2022	
1 16 21 30 35 9
4.600.000 €
sábado
23 jul. 2022	
12 26 28 34 46 7
4.400.000 €
miércoles
20 jul. 2022	
2 4 12 13 14 6
4.200.000 €
sábado
16 jul. 2022	
1 3 10 11 26 10
4.000.000 €
miércoles
13 jul. 2022	
5 14 31 34 45 7
3.700.000 €
sábado
9 jul. 2022	
22 28 36 43 46 13
3.500.000 €
miércoles
6 jul. 2022	
6 7 11 34 40 10
3.200.000 €
sábado
2 jul. 2022	
18 26 34 37 41 5
3.000.000 €
junio 2022
miércoles
29 jun. 2022	
5 17 32 34 35 1
2.700.000 €
sábado
25 jun. 2022	
1 25 35 42 46 9
2.500.000 €
miércoles
22 jun. 2022	
19 24 39 44 46 6
2.200.000 €
sábado
18 jun. 2022	
4 11 14 35 40 13
2.000.000 €
miércoles
15 jun. 2022	
20 33 39 44 48 8
1.800.000 €
sábado
11 jun. 2022	
23 40 44 46 47 5
1.600.000 €
miércoles
8 jun. 2022	
21 33 39 42 47 1
1.400.000 €
sábado
4 jun. 2022	
5 17 22 44 46 11
1.200.000 €
miércoles
1 jun. 2022	
3 11 23 42 49 1
1.000.000 €
mayo 2022
sábado
28 may. 2022	
2 4 8 23 24 13
16.294.066,96 €
miércoles
25 may. 2022	
16 18 20 37 41 12
16.000.000 €
sábado
21 may. 2022	
5 6 12 27 45 9
15.800.000 €
miércoles
18 may. 2022	
1 5 6 10 32 3
15.500.000 €
sábado
14 may. 2022	
4 32 34 40 44 8
15.300.000 €
miércoles
11 may. 2022	
4 5 14 16 48 2
15.000.000 €
sábado
7 may. 2022	
3 10 22 38 44 5
14.700.000 €
miércoles
4 may. 2022	
16 22 33 43 46 2
14.400.000 €
abril 2022
sábado
30 abr. 2022	
12 20 27 35 37 10
14.100.000 €
miércoles
27 abr. 2022	
7 15 21 23 35 5
13.800.000 €
sábado
23 abr. 2022	
10 35 39 44 46 7
13.600.000 €
miércoles
20 abr. 2022	
4 11 14 19 43 12
13.300.000 €
sábado
16 abr. 2022	
13 20 29 42 49 11
13.000.000 €
miércoles
13 abr. 2022	
13 23 33 36 37 12
12.700.000 €
sábado
9 abr. 2022	
1 10 14 17 24 1
12.500.000 €
miércoles
6 abr. 2022	
11 27 33 45 49 5
12.300.000 €
sábado
2 abr. 2022	
11 14 31 40 44 4
11.900.000 €
marzo 2022
miércoles
30 mar. 2022	
6 11 30 34 49 11
6.600.000 €
sábado
26 mar. 2022	
12 15 38 48 49 2
6.400.000 €
miércoles
23 mar. 2022	
4 27 30 37 42 5
6.100.000 €
sábado
19 mar. 2022	
10 12 15 16 32 4
5.900.000 €
miércoles
16 mar. 2022	
3 18 22 40 49 4
5.700.000 €
sábado
12 mar. 2022	
3 17 32 41 48 12
5.500.000 €
miércoles
9 mar. 2022	
10 13 24 41 48 10
5.200.000 €
sábado
5 mar. 2022	
25 27 37 40 49 3
5.000.000 €
miércoles
2 mar. 2022	
23 29 34 42 46 7
4.800.000 €
febrero 2022
sábado
26 feb. 2022	
3 12 14 39 45 5
4.600.000 €
miércoles
23 feb. 2022	
2 25 38 42 49 9
4.300.000 €
sábado
19 feb. 2022	
30 35 38 43 44 11
4.100.000 €
miércoles
16 feb. 2022	
6 11 19 33 45 3
3.800.000 €
sábado
12 feb. 2022	
1 3 8 21 49 5
3.600.000 €
miércoles
9 feb. 2022	
14 31 32 37 49 12
3.400.000 €
sábado
5 feb. 2022	
6 16 24 37 40 2
3.200.000 €
miércoles
2 feb. 2022	
7 12 18 48 49 6
2.900.000 €
enero 2022
sábado
29 ene. 2022	
7 12 19 33 45 5
2.700.000 €
miércoles
26 ene. 2022	
4 21 23 28 38 7
2.500.000 €
sábado
22 ene. 2022	
8 31 39 41 48 7
2.200.000 €
miércoles
19 ene. 2022	
2 8 18 21 26 7
2.000.000 €
sábado
15 ene. 2022	
2 5 8 20 21 5
1.900.000 €
miércoles
12 ene. 2022	
7 17 21 34 44 11
1.800.000 €
sábado
8 ene. 2022	
1 18 28 35 42 9
1.600.000 €
miércoles
5 ene. 2022	
9 21 24 39 46 3
1.200.000 €
sábado
1 ene. 2022	
16 18 23 24 31 13
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
    console.log("Parsing & Importing Manual Totoloto data (2022 - Spanish Format)...");

    // Split into lines
    const lines = RAW_DATA.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentDate: Date | null = null;
    let importedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match date: "31 dic. 2022" or "1 ene. 2022"
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
                        // Totoloto is 5/49 + 1/13
                        // Format appears to be: N1 N2 N3 N4 N5 LN
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

    console.log(`\nDone. Imported ${importedCount} Totoloto draws from 2022.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
