
import { prisma } from '../lib/prisma';

// 2018 Data (Spanish Format)
const RAW_DATA = `
diciembre 2018
sábado
29 dic. 2018	
9 17 18 24 34 13
miércoles
26 dic. 2018	
7 13 23 37 42 7
sábado
22 dic. 2018	
31 32 33 37 49 9
miércoles
19 dic. 2018	
24 30 39 40 43 11
sábado
15 dic. 2018	
4 6 12 23 35 9
miércoles
12 dic. 2018	
28 38 42 45 47 4
sábado
8 dic. 2018	
4 7 29 36 45 9
miércoles
5 dic. 2018	
12 16 33 38 46 12
sábado
1 dic. 2018	
12 17 22 40 47 9
noviembre 2018
miércoles
28 nov. 2018	
5 25 28 35 48 5
sábado
24 nov. 2018	
3 12 15 24 29 10
miércoles
21 nov. 2018	
33 37 38 47 48 4
sábado
17 nov. 2018	
7 16 25 34 36 11
miércoles
14 nov. 2018	
6 18 23 31 37 5
sábado
10 nov. 2018	
8 10 24 31 37 4
miércoles
7 nov. 2018	
3 11 17 43 48 7
sábado
3 nov. 2018	
19 26 37 38 44 3
octubre 2018
miércoles
31 oct. 2018	
5 28 36 45 48 5
sábado
27 oct. 2018	
10 16 20 35 44 2
miércoles
24 oct. 2018	
13 33 36 39 44 8
sábado
20 oct. 2018	
12 23 26 37 38 12
miércoles
17 oct. 2018	
13 17 31 37 38 5
viernes
12 oct. 2018	
10 18 33 34 43 2
miércoles
10 oct. 2018	
22 23 28 29 49 13
viernes
5 oct. 2018	
9 14 40 41 46 7
miércoles
3 oct. 2018	
3 23 24 38 45 4
septiembre 2018
sábado
29 sep. 2018	
7 28 37 44 49 4
miércoles
26 sep. 2018	
7 15 30 41 47 5
sábado
22 sep. 2018	
3 21 27 29 49 12
miércoles
19 sep. 2018	
1 3 4 24 38 5
sábado
15 sep. 2018	
8 14 19 23 35 4
miércoles
12 sep. 2018	
2 14 22 27 29 8
sábado
8 sep. 2018	
10 13 27 32 34 4
miércoles
5 sep. 2018	
4 9 19 23 28 5
sábado
1 sep. 2018	
22 29 35 37 39 3
agosto 2018
miércoles
29 ago. 2018	
5 16 27 42 46 7
sábado
25 ago. 2018	
5 8 12 17 26 7
miércoles
22 ago. 2018	
3 17 24 32 44 13
sábado
18 ago. 2018	
9 13 15 41 42 12
miércoles
15 ago. 2018	
2 3 21 31 33 9
sábado
11 ago. 2018	
19 25 38 39 49 1
miércoles
8 ago. 2018	
14 16 18 21 30 13
sábado
4 ago. 2018	
4 16 17 22 34 5
miércoles
1 ago. 2018	
8 12 23 33 42 8
julio 2018
sábado
28 jul. 2018	
13 15 25 36 37 9
miércoles
25 jul. 2018	
8 9 21 22 34 9
domingo
22 jul. 2018	
7 13 33 36 45 7
miércoles
18 jul. 2018	
3 22 23 24 43 5
sábado
14 jul. 2018	
2 8 14 41 45 2
miércoles
11 jul. 2018	
5 12 17 32 49 1
sábado
7 jul. 2018	
7 15 20 29 49 4
miércoles
4 jul. 2018	
19 22 26 40 46 7
junio 2018
viernes
29 jun. 2018	
1 7 28 34 38 6
miércoles
27 jun. 2018	
21 23 26 39 40 5
viernes
22 jun. 2018	
2 4 18 24 39 12
miércoles
20 jun. 2018	
26 28 33 39 49 1
sábado
16 jun. 2018	
2 6 14 20 48 6
miércoles
13 jun. 2018	
13 20 21 24 37 11
sábado
9 jun. 2018	
2 17 23 24 47 1
miércoles
6 jun. 2018	
6 7 15 25 43 7
sábado
2 jun. 2018	
10 23 29 37 48 4
mayo 2018
miércoles
30 may. 2018	
4 17 21 35 41 4
sábado
26 may. 2018	
2 10 24 44 45 5
miércoles
23 may. 2018	
8 13 20 25 29 1
sábado
19 may. 2018	
29 32 35 38 40 3
miércoles
16 may. 2018	
2 8 17 27 34 7
sábado
12 may. 2018	
22 23 25 28 34 9
martes
8 may. 2018	
5 15 36 37 40 13
sábado
5 may. 2018	
4 8 25 33 37 4
miércoles
2 may. 2018	
11 14 42 46 47 9
abril 2018
sábado
28 abr. 2018	
12 23 29 43 44 12
miércoles
25 abr. 2018	
1 25 30 31 40 11
sábado
21 abr. 2018	
1 22 27 37 41 5
miércoles
18 abr. 2018	
7 15 19 25 34 12
sábado
14 abr. 2018	
12 19 25 31 43 5
miércoles
11 abr. 2018	
4 9 17 29 47 13
sábado
7 abr. 2018	
8 13 18 40 45 4
miércoles
4 abr. 2018	
1 20 27 35 40 8
marzo 2018
sábado
31 mar. 2018	
13 17 34 38 48 4
miércoles
28 mar. 2018	
14 24 35 40 45 6
sábado
24 mar. 2018	
7 10 13 14 38 5
miércoles
21 mar. 2018	
5 8 29 33 37 6
sábado
17 mar. 2018	
4 12 26 44 47 8
miércoles
14 mar. 2018	
19 21 33 36 49 3
sábado
10 mar. 2018	
18 37 38 45 48 5
miércoles
7 mar. 2018	
22 30 38 41 48 10
sábado
3 mar. 2018	
15 31 33 42 44 4
febrero 2018
miércoles
28 feb. 2018	
21 27 35 38 46 11
sábado
24 feb. 2018	
10 16 24 28 45 12
miércoles
21 feb. 2018	
11 21 22 33 46 8
sábado
17 feb. 2018	
4 14 33 36 37 2
miércoles
14 feb. 2018	
5 9 16 22 27 10
sábado
10 feb. 2018	
14 15 19 30 36 13
miércoles
7 feb. 2018	
14 19 36 45 49 4
sábado
3 feb. 2018	
6 20 26 42 49 2
enero 2018
miércoles
31 ene. 2018	
1 4 29 36 42 10
sábado
27 ene. 2018	
3 26 36 38 39 10
miércoles
24 ene. 2018	
3 13 15 21 32 1
viernes
19 ene. 2018	
9 24 34 39 41 12
miércoles
17 ene. 2018	
14 19 20 39 48 2
sábado
13 ene. 2018	
5 10 36 38 43 3
miércoles
10 ene. 2018	
17 21 32 43 47 4
sábado
6 ene. 2018	
5 6 10 34 39 1
miércoles
3 ene. 2018	
14 16 23 40 46 12
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
    console.log("Parsing & Importing Manual Totoloto data (2018 - Spanish Format)...");

    // Split into lines
    const lines = RAW_DATA.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentDate: Date | null = null;
    let importedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match date: "31 dic. 2018" or "1 ene. 2018"
        // Sometimes day names are first, we look for line starting with day number
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

    console.log(`\nDone. Imported ${importedCount} Totoloto draws from 2018.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
