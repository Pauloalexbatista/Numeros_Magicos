import * as XLSX from 'xlsx';
import path from 'path';
import { prisma } from '../../lib/prisma';

function excelDateToDate(excelDate: number): Date {
    // Excel date is days since 1899-12-30. JS date is ms since 1970-01-01.
    const unixTimestamp = (excelDate - 25569) * 86400 * 1000;
    return new Date(Math.round(unixTimestamp));
}

async function repairTotoloto() {
    console.log('--- INICIANDO REPARAÇÃO DA BASE DE DADOS DO TOTOLOTO ---');
    
    const filePath = path.join(process.cwd(), 'Exportacao_Completa_Sorteios.xlsm');
    console.log(`A ler ficheiro: ${filePath}`);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = 'Exportacao_Completa_Sorteios';
    const sheet = workbook.Sheets[sheetName];
    
    // Ler os dados como array de arrays
    const rawData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    
    // Ignorar cabecalho
    const rows = rawData.slice(1);
    
    console.log(`Total de linhas lidas: ${rows.length}`);
    
    const totolotoDraws = rows.filter(row => row[0] === 'TOTOLOTO');
    console.log(`Total de sorteios do TOTOLOTO encontrados no Excel: ${totolotoDraws.length}`);
    
    if (totolotoDraws.length === 0) {
        console.error('Nenhum sorteio TOTOLOTO encontrado. Abortando.');
        return;
    }

    // 1. Apagar TODOS os registos dependentes primeiro (FK constraints) e depois os sorteios do TOTOLOTO
    console.log('A limpar dependências (Performances, Previsões) do Totoloto...');
    
    await prisma.systemPerformance.deleteMany({ where: { game: 'TOTOLOTO' } });
    await prisma.starSystemPerformance.deleteMany({ where: { game: 'TOTOLOTO' } });
    await prisma.systemPerformanceStaging.deleteMany({ where: { game: 'TOTOLOTO' } });
    await prisma.systemPrediction.deleteMany({ where: { game: 'TOTOLOTO' } });
    
    console.log('A apagar histórico corrompido do TOTOLOTO...');
    const delResult = await prisma.draw.deleteMany({
        where: { game: 'TOTOLOTO' }
    });
    console.log(`Foram apagados ${delResult.count} sorteios corrompidos da base de dados.`);
    
    // 2. Inserir os sorteios do Excel
    console.log('A reconstruir histórico com base no Ficheiro Calendário mestre...');
    
    let insertedCount = 0;
    let failedCount = 0;
    
    for (const row of totolotoDraws) {
        try {
            // [0] JOGO, [1] DATA, [2] N1, [3] N2, [4] N3, [5] N4, [6] N5, [7] N6, [8] ESTRELA_1, [9] ESTRELA_2
            const dateNum = row[1];
            // Fix timezone: We set it strictly to noon UTC to avoid date shifting
            let drawDate: Date;
            if (typeof dateNum === 'number') {
                drawDate = excelDateToDate(dateNum);
            } else {
                drawDate = new Date(dateNum);
            }
            drawDate.setUTCHours(12, 0, 0, 0);
            
            const n1 = parseInt(row[2]);
            const n2 = parseInt(row[3]);
            const n3 = parseInt(row[4]);
            const n4 = parseInt(row[5]);
            const n5 = parseInt(row[6]);
            
            // Validate numbers
            if (isNaN(n1) || isNaN(n2) || isNaN(n3) || isNaN(n4) || isNaN(n5)) {
                // Ignore empty rows
                continue;
            }
            
            const numbers = [n1, n2, n3, n4, n5].sort((a, b) => a - b);
            
            // Totoloto sometimes has Lucky Number in ESTRELA_1 (index 8) or N6 (index 7) depending on formatting.
            let star1 = parseInt(row[8]);
            if (isNaN(star1)) {
                 // Try N6 position if it's there
                 star1 = parseInt(row[7]);
                 if (isNaN(star1)) {
                     console.log('Estrela não encontrada na data:', drawDate, 'Row:', row);
                     continue;
                 }
            }
            const stars = [star1];
            
            await prisma.draw.create({
                data: {
                    game: 'TOTOLOTO',
                    date: drawDate,
                    numbers: JSON.stringify(numbers),
                    stars: JSON.stringify(stars),
                    numbersDrawOrder: JSON.stringify(numbers),
                    starsDrawOrder: JSON.stringify(stars),
                    hasWinner: false,
                    jackpot: 0
                }
            });
            insertedCount++;
        } catch (err) {
            console.error('Erro na linha:', row, err.message);
            failedCount++;
        }
    }
    
    console.log(`--- REPARAÇÃO CONCLUÍDA ---`);
    console.log(`✅ Sorteios Inseridos com Sucesso: ${insertedCount}`);
    console.log(`❌ Erros/Falhas: ${failedCount}`);
    
    if (insertedCount > 0) {
        console.log(`⚠️ IMPORTANTE: Deves agora correr o MASTER_UPDATE ou recalcular todos os sistemas de Totoloto, uma vez que a BD foi trocada.`);
    }
}

repairTotoloto().catch(console.error).finally(() => prisma.$disconnect());
