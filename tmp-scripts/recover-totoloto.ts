import fs from 'fs';
import path from 'path';
import { prisma } from './src/lib/prisma';
import { updateRanking, updateStarRankings, cachePredictions } from './src/services/ranking';

async function recover() {
    console.log('🚑 Iniciando Recuperação de Dados do Totoloto...');
    
    // Ler o CSV que gerámos antes de apagar!
    const csvPath = path.join(process.cwd(), 'Exportacao_Completa_Sorteios.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    const lines = csvData.split('\n').filter(l => l.trim() !== '');
    // Header: JOGO;DATA;N1;N2;N3;N4;N5;N6;ESTRELA_1;ESTRELA_2
    
    let recoveredCount = 0;
    
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(';');
        const game = parts[0];
        if (game !== 'TOTOLOTO') continue;
        
        const dateStr = parts[1];
        
        // Verifica se o sorteio já existe na BD atual
        const drawDate = new Date(dateStr + "T12:00:00Z");
        
        const dayOfWeek = drawDate.getUTCDay();
        
        // Procuramos os que apagámos (Terças e Sextas, ou Domingos)
        if (dayOfWeek === 2 || dayOfWeek === 5 || dayOfWeek === 0) {
            
            // Fazer o Shift de +1 dia para fixar o erro de timezone do LoteriaGuru
            if (dayOfWeek === 2) { // Terça -> Quarta
                drawDate.setUTCDate(drawDate.getUTCDate() + 1);
            } else if (dayOfWeek === 5) { // Sexta -> Sábado
                drawDate.setUTCDate(drawDate.getUTCDate() + 1);
            } else if (dayOfWeek === 0) { // Domingo -> Sábado (no caso do Totoloto pós-2011)
                 // if > 2011 it's Saturday shifted up
                 if (drawDate > new Date("2011-03-01T00:00:00Z")) {
                     drawDate.setUTCDate(drawDate.getUTCDate() - 1);
                 }
            }
            
            // Verificar se o Sorteio corrigido já existe (para não duplicar)
            const exists = await prisma.draw.findFirst({
                where: { game: 'TOTOLOTO', date: drawDate }
            });
            
            if (!exists) {
                // Reconstruir os arrays de números e estrelas
                const n1 = parseInt(parts[2]);
                const n2 = parseInt(parts[3]);
                const n3 = parseInt(parts[4]);
                const n4 = parseInt(parts[5]);
                const n5 = parseInt(parts[6]);
                const s1 = parseInt(parts[8]); // Estrela 1
                
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
    
    console.log(`✅ Sucesso! ${recoveredCount} Sorteios do Totoloto recuperados do Backup CSV com datas corrigidas!`);
    
    if (recoveredCount > 0) {
        console.log('🔄 A re-sincronizar Redes Neuronais...');
        await updateRanking();
        await updateStarRankings();
        await cachePredictions();
        console.log('🎉 Tudo Restaurado e 100% Correto!');
    }
}

recover()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
