
import { prisma } from '../lib/prisma';

// 2020 Data (Spanish Format)
const RAW_DATA = `
diciembre 2020
miércoles
30 dic. 2020	
7 24 36 40 42 10
5.200.000 €
sábado
26 dic. 2020	
10 19 21 30 43 12
5.000.000 €
miércoles
23 dic. 2020	
4 7 15 19 27 13
4.800.000 €
sábado
19 dic. 2020	
13 25 34 40 44 12
4.600.000 €
miércoles
16 dic. 2020	
9 32 35 43 49 12
4.400.000 €
sábado
12 dic. 2020	
4 10 18 36 49 9
4.200.000 €
miércoles
9 dic. 2020	
4 7 8 17 18 9
4.000.000 €
sábado
5 dic. 2020	
6 14 20 42 46 6
3.800.000 €
miércoles
2 dic. 2020	
7 20 26 40 45 9
3.500.000 €
noviembre 2020
sábado
28 nov. 2020	
27 28 32 38 42 9
3.400.000 €
miércoles
25 nov. 2020	
7 14 15 18 42 3
3.200.000 €
sábado
21 nov. 2020	
10 23 28 31 32 12
3.000.000 €
miércoles
18 nov. 2020	
1 15 21 26 27 6
2.800.000 €
sábado
14 nov. 2020	
1 12 38 39 40 11
2.600.000 €
miércoles
11 nov. 2020	
8 18 20 44 48 1
2.400.000 €
sábado
7 nov. 2020	
5 7 12 23 48 6
2.200.000 €
miércoles
4 nov. 2020	
17 22 26 27 36 9
2.000.000 €
octubre 2020
sábado
31 oct. 2020	
1 20 27 36 46 4
1.900.000 €
miércoles
28 oct. 2020	
18 26 32 33 45 1
1.700.000 €
sábado
24 oct. 2020	
6 11 23 27 30 8
1.500.000 €
miércoles
21 oct. 2020	
2 19 21 44 49 2
1.300.000 €
sábado
17 oct. 2020	
3 5 14 35 38 1
1.200.000 €
miércoles
14 oct. 2020	
23 24 28 38 48 7
1.000.000 €
sábado
10 oct. 2020	
8 20 22 27 39 8
4.993.900 €
miércoles
7 oct. 2020	
26 33 36 37 40 4
4.700.000 €
sábado
3 oct. 2020	
11 13 22 33 41 8
4.600.000 €
septiembre 2020
miércoles
30 sep. 2020	
10 17 24 28 33 9
4.400.000 €
sábado
26 sep. 2020	
9 26 29 33 37 10
4.200.000 €
miércoles
23 sep. 2020	
4 10 13 27 43 12
4.000.000 €
sábado
19 sep. 2020	
1 5 16 24 44 13
3.800.000 €
miércoles
16 sep. 2020	
4 6 9 23 29 4
3.600.000 €
sábado
12 sep. 2020	
24 25 31 35 38 7
3.400.000 €
miércoles
9 sep. 2020	
1 5 24 35 43 2
3.200.000 €
sábado
5 sep. 2020	
17 20 27 43 49 10
3.000.000 €
miércoles
2 sep. 2020	
13 18 37 40 43 2
2.800.000 €
agosto 2020
sábado
29 ago. 2020	
10 12 24 28 47 8
2.600.000 €
miércoles
26 ago. 2020	
2 9 23 38 45 7
2.400.000 €
sábado
22 ago. 2020	
11 18 23 36 46 9
2.200.000 €
miércoles
19 ago. 2020	
2 5 23 37 48 7
2.100.000 €
sábado
15 ago. 2020	
12 18 34 38 46 2
1.900.000 €
miércoles
12 ago. 2020	
3 5 7 19 26 4
1.700.000 €
sábado
8 ago. 2020	
11 13 27 33 47 12
1.500.000 €
miércoles
5 ago. 2020	
4 16 25 42 45 12
1.300.000 €
sábado
1 ago. 2020	
13 15 19 35 38 10
1.200.000 €
julio 2020
miércoles
29 jul. 2020	
17 20 23 33 35 4
507.913,21 €
sábado
25 jul. 2020	
9 11 17 23 33 8
4.840.703,79 €
miércoles
22 jul. 2020	
11 14 41 46 49 2
4.600.000 €
sábado
18 jul. 2020	
19 29 31 38 47 10
4.400.000 €
miércoles
15 jul. 2020	
7 24 26 31 41 5
4.200.000 €
sábado
11 jul. 2020	
13 16 21 44 48 12
4.000.000 €
miércoles
8 jul. 2020	
10 16 30 32 45 5
3.900.000 €
sábado
4 jul. 2020	
20 23 32 38 48 3
3.700.000 €
miércoles
1 jul. 2020	
25 36 37 44 47 7
3.500.000 €
junio 2020
sábado
27 jun. 2020	
10 14 32 42 44 12
3.300.000 €
miércoles
24 jun. 2020	
6 21 22 30 36 11
3.100.000 €
sábado
20 jun. 2020	
16 31 35 41 44 2
2.900.000 €
miércoles
17 jun. 2020	
13 14 38 39 43 1
2.700.000 €
sábado
13 jun. 2020	
11 17 18 19 46 10
2.600.000 €
miércoles
10 jun. 2020	
16 26 35 40 45 12
2.400.000 €
sábado
6 jun. 2020	
25 31 32 41 49 10
2.200.000 €
miércoles
3 jun. 2020	
1 9 14 35 48 1
2.000.000 €
mayo 2020
sábado
30 may. 2020	
2 7 20 24 33 8
1.800.000 €
miércoles
27 may. 2020	
19 26 30 33 45 13
1.600.000 €
sábado
23 may. 2020	
1 12 19 25 44 5
1.500.000 €
miércoles
20 may. 2020	
17 41 44 45 49 6
1.300.000 €
sábado
16 may. 2020	
3 16 29 36 46 5
1.100.000 €
miércoles
13 may. 2020	
3 19 27 38 45 2
1.000.000 €
sábado
9 may. 2020	
9 26 34 39 46 8
3.122.696,31 €
miércoles
6 may. 2020	
5 20 30 36 45 6
2.800.000 €
sábado
2 may. 2020	
11 17 22 42 43 12
2.700.000 €
abril 2020
miércoles
29 abr. 2020	
26 42 43 44 48 13
2.500.000 €
sábado
25 abr. 2020	
7 14 25 30 49 6
2.300.000 €
miércoles
22 abr. 2020	
8 14 19 24 32 2
2.200.000 €
sábado
18 abr. 2020	
5 15 19 30 37 4
2.000.000 €
miércoles
15 abr. 2020	
5 7 23 42 49 6
1.800.000 €
sábado
11 abr. 2020	
9 10 28 43 44 6
1.700.000 €
miércoles
8 abr. 2020	
19 28 30 42 43 11
1.500.000 €
sábado
4 abr. 2020	
15 16 23 32 39 12
1.400.000 €
miércoles
1 abr. 2020	
15 21 29 35 41 11
1.200.000 €
marzo 2020
sábado
28 mar. 2020	
13 25 26 36 49 6
1.100.000 €
miércoles
25 mar. 2020	
14 35 37 40 47 11
419.040,86 €
sábado
21 mar. 2020	
6 14 27 38 49 9
14.439.443,87 €
miércoles
18 mar. 2020	
9 10 35 41 42 5
14.200.000 €
sábado
14 mar. 2020	
4 11 25 30 33 12
14.000.000 €
miércoles
11 mar. 2020	
18 23 36 38 41 11
13.800.000 €
sábado
7 mar. 2020	
17 27 29 37 47 5
13.600.000 €
miércoles
4 mar. 2020	
16 20 21 36 37 13
13.400.000 €
febrero 2020
sábado
29 feb. 2020	
7 15 19 41 43 10
13.200.000 €
miércoles
26 feb. 2020	
4 24 34 40 42 6
13.000.000 €
sábado
22 feb. 2020	
13 25 28 36 45 2
12.700.000 €
miércoles
19 feb. 2020	
5 18 34 36 37 8
12.500.000 €
sábado
15 feb. 2020	
5 9 24 38 47 2
12.200.000 €
miércoles
12 feb. 2020	
7 14 28 36 40 12
12.000.000 €
sábado
8 feb. 2020	
13 31 36 37 45 1
11.800.000 €
miércoles
5 feb. 2020	
18 19 31 35 45 13
11.500.000 €
sábado
1 feb. 2020	
6 22 26 32 47 4
11.300.000 €
enero 2020
miércoles
29 ene. 2020	
12 15 19 33 39 12
11.100.000 €
sábado
25 ene. 2020	
3 26 36 37 43 7
10.900.000 €
miércoles
22 ene. 2020	
8 20 23 45 48 8
10.700.000 €
sábado
18 ene. 2020	
5 21 23 24 36 10
10.400.000 €
miércoles
15 ene. 2020	
17 26 32 42 43 9
10.200.000 €
sábado
11 ene. 2020	
12 13 17 25 38 9
10.000.000 €
miércoles
8 ene. 2020	
27 40 46 47 49 1
9.700.000 €
sábado
4 ene. 2020	
24 31 40 47 49 9
9.600.000 €
miércoles
1 ene. 2020	
1 25 31 44 46 5
9.400.000 €
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
    console.log("Parsing & Importing Manual Totoloto data (2020 - Spanish Format)...");

    // Split into lines
    const lines = RAW_DATA.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentDate: Date | null = null;
    let importedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match date: "31 dic. 2020" or "1 ene. 2020"
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

    console.log(`\nDone. Imported ${importedCount} Totoloto draws from 2020.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
