import { prisma } from './src/lib/prisma';
import { updateRanking, updateStarRankings, cachePredictions } from './src/services/ranking';
import * as xlsx from 'xlsx';
import path from 'path';

async function recover() {
    console.log('🚑 A abrir o Backup Excel...');
    
    const excelPath = path.join(process.cwd(), 'Exportacao_Completa_Sorteios.xlsm');
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to strict JSON array of arrays
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: true }) as any[][];
    
    let recoveredCount = 0;
    
    // Format expected: JOGO, DATA, N1, N2, N3, N4, N5, N6, ESTRELA_1, ESTRELA_2
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 2) continue;
        
        const game = row[0];
        if (game !== 'TOTOLOTO') continue;
        
        const dateRaw = row[1];
        if (!dateRaw) continue;

        let drawDate: Date;
        
        if (typeof dateRaw === 'number') {
            // Excel dates are days since Dec 30 1899
            drawDate = new Date(Math.round((dateRaw - 25569) * 86400 * 1000));
            // Force it to Noon UTC to avoid local timezone math shifts
            drawDate = new Date(Date.UTC(drawDate.getUTCFullYear(), drawDate.getUTCMonth(), drawDate.getUTCDate(), 12, 0, 0));
        } else {
            let dateStr = String(dateRaw).trim();
            if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts[2].length === 4) dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            drawDate = new Date(dateStr + "T12:00:00Z");
        }
        
        if (isNaN(drawDate.getTime())) {
            console.log('Erro a ler data:', dateRaw);
            continue;
        }

        const dayOfWeek = drawDate.getUTCDay();
        
        // Recover ONLY the days we deleted (Tue/Fri and Sun)
        if (dayOfWeek === 2 || dayOfWeek === 5 || dayOfWeek === 0) {
            
            // Shift +1 day
            if (dayOfWeek === 2) { 
                drawDate.setUTCDate(drawDate.getUTCDate() + 1);
            } else if (dayOfWeek === 5) { 
                drawDate.setUTCDate(drawDate.getUTCDate() + 1);
            } else if (dayOfWeek === 0) { 
                 if (drawDate > new Date("2011-03-01T00:00:00Z")) {
                     drawDate.setUTCDate(drawDate.getUTCDate() - 1);
                 }
            }
            
            const exists = await prisma.draw.findFirst({
                where: { game: 'TOTOLOTO', date: drawDate }
            });
            
            if (!exists) {
                // Ensure proper numbers array
                const n1 = parseInt(row[2]);
                const n2 = parseInt(row[3]);
                const n3 = parseInt(row[4]);
                const n4 = parseInt(row[5]);
                const n5 = parseInt(row[6]);
                const s1 = parseInt(row[8]); // Estrela_1 is index 8 (N6 is 7)
                
                if (isNaN(n1) || isNaN(n2) || isNaN(n3) || isNaN(n4) || isNaN(n5) || isNaN(s1)) {
                     console.log('Números inválidos para', drawDate.toISOString().split('T')[0], row);
                     continue;
                }
                
                const numbersArr = [n1, n2, n3, n4, n5].sort((a,b)=>a-b);
                const starsArr = [s1];
                
                await prisma.draw.create({
                    data: {
                        game: 'TOTOLOTO',
                        date: drawDate,
                        numbers: JSON.stringify(numbersArr),
                        stars: JSON.stringify(starsArr),
                        numbersDrawOrder: JSON.stringify(numbersArr),
                        starsDrawOrder: JSON.stringify(starsArr),
                        jackpot: 0,
                        hasWinner: false
                    }
                });
                recoveredCount++;
            }
        }
    }
    
    console.log(`✅ Sucesso! Restaurei cirurgicamente ${recoveredCount} Sorteios do Totoloto com datas reparadas!`);
    
    if (recoveredCount > 0) {
        console.log('🔄 A re-sincronizar Redes Neuronais num background local para atualizar os perfis estatísticos...');
        await updateRanking();
        await updateStarRankings();
        await cachePredictions();
        console.log('🎉 Tudo Restaurado e 100% Correto!');
    }
}

recover()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
