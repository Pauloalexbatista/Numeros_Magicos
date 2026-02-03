
import { prisma } from '../lib/prisma';

// 2016 Data (Spanish Format)
const RAW_DATA = `
diciembre 2016
viernes
30 dic. 2016	
22 27 29 30 42 10
miércoles
28 dic. 2016	
1 3 6 23 38 10
sábado
24 dic. 2016	
7 10 21 34 43 13
miércoles
21 dic. 2016	
8 10 23 33 43 10
sábado
17 dic. 2016	
9 16 19 32 38 6
miércoles
14 dic. 2016	
13 32 33 45 47 13
viernes
9 dic. 2016	
2 7 24 30 39 11
miércoles
7 dic. 2016	
4 6 15 17 28 1
sábado
3 dic. 2016	
18 20 22 25 47 5
noviembre 2016
miércoles
30 nov. 2016	
4 7 25 26 38 11
sábado
26 nov. 2016	
4 8 11 19 33 2
miércoles
23 nov. 2016	
5 25 33 36 39 6
sábado
19 nov. 2016	
15 16 34 38 45 8
miércoles
16 nov. 2016	
7 31 33 42 48 9
sábado
12 nov. 2016	
25 36 39 43 49 3
miércoles
9 nov. 2016	
1 12 18 27 46 5
sábado
5 nov. 2016	
1 9 24 43 44 2
miércoles
2 nov. 2016	
11 35 43 47 49 12
octubre 2016
sábado
29 oct. 2016	
12 27 29 33 47 10
miércoles
26 oct. 2016	
10 11 23 29 36 9
sábado
22 oct. 2016	
6 8 27 28 45 7
miércoles
19 oct. 2016	
8 31 34 39 42 6
sábado
15 oct. 2016	
1 10 16 30 45 3
miércoles
12 oct. 2016	
11 17 28 33 36 5
sábado
8 oct. 2016	
6 18 20 32 48 9
miércoles
5 oct. 2016	
13 17 20 25 38 7
sábado
1 oct. 2016	
12 17 18 23 47 13
septiembre 2016
miércoles
28 sep. 2016	
1 12 31 40 47 3
sábado
24 sep. 2016	
3 12 33 36 46 7
miércoles
21 sep. 2016	
6 15 21 38 47 13
sábado
17 sep. 2016	
3 14 18 19 40 1
miércoles
14 sep. 2016	
2 33 37 39 42 7
sábado
10 sep. 2016	
4 13 14 17 33 2
viernes
9 sep. 2016	
12 13 25 30 35 2
sábado
3 sep. 2016	
6 9 22 28 44 11
agosto 2016
miércoles
31 ago. 2016	
3 16 21 31 42 1
sábado
27 ago. 2016	
5 11 13 33 34 13
miércoles
24 ago. 2016	
4 10 31 32 33 5
sábado
20 ago. 2016	
1 7 13 23 47 7
miércoles
17 ago. 2016	
1 8 9 34 35 6
viernes
12 ago. 2016	
4 7 23 32 34 7
miércoles
10 ago. 2016	
15 38 40 45 47 13
sábado
6 ago. 2016	
2 11 13 26 36 2
miércoles
3 ago. 2016	
27 35 36 43 44 6
julio 2016
sábado
30 jul. 2016	
9 18 19 25 36 9
miércoles
27 jul. 2016	
10 27 31 32 34 11
sábado
23 jul. 2016	
8 12 17 22 29 10
miércoles
20 jul. 2016	
2 15 21 31 37 2
sábado
16 jul. 2016	
4 13 23 28 46 8
miércoles
13 jul. 2016	
22 25 30 38 41 1
sábado
9 jul. 2016	
2 7 10 22 32 6
miércoles
6 jul. 2016	
21 22 35 37 46 8
sábado
2 jul. 2016	
2 12 20 42 47 9
junio 2016
miércoles
29 jun. 2016	
7 10 11 19 22 2
sábado
25 jun. 2016	
16 28 34 38 43 4
miércoles
22 jun. 2016	
4 21 30 41 44 10
sábado
18 jun. 2016	
2 9 32 34 37 12
miércoles
15 jun. 2016	
18 36 37 40 42 9
sábado
11 jun. 2016	
1 15 34 37 48 13
miércoles
8 jun. 2016	
6 22 32 41 45 9
sábado
4 jun. 2016	
6 8 11 45 49 6
miércoles
1 jun. 2016	
2 12 14 20 35 7
mayo 2016
sábado
28 may. 2016	
7 25 37 40 46 7
miércoles
25 may. 2016	
5 11 26 33 42 11
sábado
21 may. 2016	
3 8 23 35 47 11
miércoles
18 may. 2016	
9 20 27 34 48 4
sábado
14 may. 2016	
14 24 33 34 41 1
miércoles
11 may. 2016	
11 16 43 46 48 9
sábado
7 may. 2016	
4 6 39 41 42 10
miércoles
4 may. 2016	
5 16 29 40 45 10
abril 2016
sábado
30 abr. 2016	
1 2 18 27 42 12
miércoles
27 abr. 2016	
1 8 13 14 46 8
sábado
23 abr. 2016	
6 20 42 44 46 9
miércoles
20 abr. 2016	
4 9 27 38 41 4
sábado
16 abr. 2016	
14 19 24 36 45 3
jueves
14 abr. 2016	
1 13 26 29 45 10
sábado
9 abr. 2016	
2 9 11 23 39 4
miércoles
6 abr. 2016	
2 14 21 27 33 6
sábado
2 abr. 2016	
6 10 11 15 16 5
marzo 2016
miércoles
30 mar. 2016	
5 9 15 22 34 1
sábado
26 mar. 2016	
8 36 40 43 46 5
martes
22 mar. 2016	
3 20 31 33 37 8
viernes
18 mar. 2016	
14 16 19 42 48 5
jueves
17 mar. 2016	
1 6 8 18 48 10
sábado
12 mar. 2016	
1 3 6 7 46 13
miércoles
9 mar. 2016	
9 20 38 46 47 4
sábado
5 mar. 2016	
4 6 9 19 39 11
miércoles
2 mar. 2016	
5 7 24 42 46 3
febrero 2016
sábado
27 feb. 2016	
18 21 29 37 39 9
miércoles
24 feb. 2016	
2 7 31 44 49 7
sábado
20 feb. 2016	
2 8 22 26 34 7
miércoles
17 feb. 2016	
15 29 30 47 48 2
sábado
13 feb. 2016	
8 9 21 37 40 7
miércoles
10 feb. 2016	
2 7 14 21 33 6
sábado
6 feb. 2016	
21 23 25 36 44 4
miércoles
3 feb. 2016	
10 22 33 41 42 4
enero 2016
sábado
30 ene. 2016	
3 5 35 39 41 12
miércoles
27 ene. 2016	
23 30 33 44 46 1
sábado
23 ene. 2016	
1 3 25 48 49 12
miércoles
20 ene. 2016	
10 21 39 43 49 11
sábado
16 ene. 2016	
4 6 12 47 48 3
miércoles
13 ene. 2016	
5 7 22 24 49 5
sábado
9 ene. 2016	
5 19 21 39 46 2
miércoles
6 ene. 2016	
8 12 15 43 47 1
sábado
2 ene. 2016	
22 30 31 48 49 8
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
    console.log("Parsing & Importing Manual Totoloto data (2016 - Spanish Format)...");

    // Split into lines
    const lines = RAW_DATA.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentDate: Date | null = null;
    let importedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match date: "30 dic. 2016" or "4 ene. 2016"
        const dateMatch = line.match(/^(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.?\s+(\d{4})/);

        if (dateMatch) {
            const day = dateMatch[1].padStart(2, '0');
            const monthStr = dateMatch[2];
            const year = dateMatch[3];
            const month = MONTH_MAP[monthStr];

            if (month) {
                // Noon UTC
                currentDate = new Date(`${year}-${month}-${day}T12:00:00Z`);

                // Usually the next line has numbers: "22 27 29 30 42 10"
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

    console.log(`\nDone. Imported ${importedCount} Totoloto draws from 2016.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
