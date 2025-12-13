import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

async function importFromExcel() {
    const filePath = path.join(process.cwd(), 'tools', 'BD com todos os sorteios.xlsx');

    console.log('📊 INICIANDO RESTAURO DE DADOS...');
    console.log(`📂 Lendo ficheiro: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error('❌ Ficheiro não encontrado!');
        return;
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`📝 Linhas encontradas: ${data.length}`);

    if (data.length === 0) {
        console.warn('⚠️ O ficheiro parece estar vazio.');
        return;
    }

    // Inspect first row to determine column names
    console.log('🔍 Primeira linha (Exemplo):', data[0]);

    let imported = 0;

    for (const row of data) {
        try {
            // Adjust these keys based on the log output if needed. 
            // Common formats in these files: "Data", "N1", "N2"... or "d 1", "e 1"...
            // I'll try to detect common patterns or default to standard guess

            let dateStr = row['Data'] || row['Date'] || row['date'] || row['DATE'];

            // Excel dates are sometimes numbers (days since 1900)
            let dateDisplay: Date;
            if (typeof dateStr === 'number') {
                dateDisplay = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
            } else if (typeof dateStr === 'string') {
                // Parse DD/MM/YYYY
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    // Assume DD/MM/YYYY
                    dateDisplay = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                } else {
                    dateDisplay = new Date(dateStr);
                }
            } else {
                // Try parsing from raw if it's a date object
                dateDisplay = new Date(dateStr);
            }

            if (isNaN(dateDisplay.getTime())) {
                console.warn(`⚠️ Data inválida na linha: ${JSON.stringify(row)}`);
                continue;
            }

            // Extract Numbers and Stars
            // Looking for N1..N5 and E1..E2 (or S1..S2)
            const n1 = row['N1'] || row['n1'] || row['B1']; // B for Bola?
            const n2 = row['N2'] || row['n2'] || row['B2'];
            const n3 = row['N3'] || row['n3'] || row['B3'];
            const n4 = row['N4'] || row['n4'] || row['B4'];
            const n5 = row['N5'] || row['n5'] || row['B5'];

            const e1 = row['E1'] || row['e1'] || row['S1']; // S for Star
            const e2 = row['E2'] || row['e2'] || row['S2'];

            if (!n1 || !n5 || !e1 || !e2) {
                // Try array based if keys are weird? No, let's rely on standard keys first.
                // console.warn('Dados incompletos:', row);
                continue;
            }

            const numbers = [n1, n2, n3, n4, n5].map(Number).sort((a, b) => a - b);
            const stars = [e1, e2].map(Number).sort((a, b) => a - b);

            await prisma.draw.upsert({
                where: { date: dateDisplay },
                update: {
                    numbers: JSON.stringify(numbers),
                    stars: JSON.stringify(stars),
                    // Resetting these to default/null as we are re-importing raw data
                    jackpot: null,
                    hasWinner: false
                },
                create: {
                    date: dateDisplay,
                    numbers: JSON.stringify(numbers),
                    stars: JSON.stringify(stars),
                    jackpot: null,
                    hasWinner: false
                }
            });

            imported++;
            if (imported % 100 === 0) process.stdout.write('.');

        } catch (error) {
            console.error(`❌ Erro na linha:`, error.message);
        }
    }

    console.log(`\n\n✅ Sucesso: ${imported} sorteios importados/atualizados.`);
}

importFromExcel()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
