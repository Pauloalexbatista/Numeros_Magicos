import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

async function createVortexAnalysisExcel() {
    console.log('📊 Criando Excel com últimos 100 sorteios e predições Vortex...\n');

    // Get last 100 draws
    const draws = await prisma.draw.findMany({
        orderBy: { id: 'desc' },
        take: 100
    });

    draws.reverse(); // Oldest first

    // Get predictions for these draws
    const predictions = await prisma.systemPrediction.findMany({
        where: {
            systemName: 'Vortex Multi-Canal (2 canais)',
            drawId: { in: draws.map(d => d.id) }
        },
        orderBy: { drawId: 'asc' }
    });

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Sorteios e Predições
    const data: any[] = [];

    // Header
    data.push([
        'Sorteio',
        'Data',
        'Num 1',
        'Num 2',
        'Num 3',
        'Num 4',
        'Num 5',
        'Predição (25 números)',
        'Hits',
        'Acertou?'
    ]);

    for (const draw of draws) {
        const numbers = JSON.parse(draw.numbers as string);
        const pred = predictions.find(p => p.drawId === draw.id);

        const predNumbers = pred ? JSON.parse(pred.prediction) : [];
        const predStr = predNumbers.slice(0, 25).join(', ');
        const hits = pred ? pred.hits : 0;
        const acertou = hits === 5 ? 'JACKPOT!' : hits >= 4 ? 'Muito Bom' : hits >= 3 ? 'Bom' : '';

        data.push([
            draw.id,
            draw.date.toLocaleDateString('pt-PT'),
            numbers[0],
            numbers[1],
            numbers[2],
            numbers[3],
            numbers[4],
            predStr,
            hits,
            acertou
        ]);
    }

    const ws1 = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws1['!cols'] = [
        { wch: 8 },  // Sorteio
        { wch: 12 }, // Data
        { wch: 6 },  // Num 1
        { wch: 6 },  // Num 2
        { wch: 6 },  // Num 3
        { wch: 6 },  // Num 4
        { wch: 6 },  // Num 5
        { wch: 80 }, // Predição
        { wch: 6 },  // Hits
        { wch: 12 }  // Acertou
    ];

    XLSX.utils.book_append_sheet(wb, ws1, 'Sorteios e Predições');

    // Sheet 2: Estatísticas
    const stats: any[] = [];
    stats.push(['Estatísticas Vortex Multi-Canal (2 canais)']);
    stats.push([]);
    stats.push(['Total de Sorteios:', draws.length]);
    stats.push(['Total de Predições:', predictions.length]);
    stats.push([]);

    const totalHits = predictions.reduce((sum, p) => sum + p.hits, 0);
    const avgHits = (totalHits / predictions.length).toFixed(2);
    const jackpots = predictions.filter(p => p.hits === 5).length;
    const fourHits = predictions.filter(p => p.hits === 4).length;
    const threeHits = predictions.filter(p => p.hits === 3).length;

    stats.push(['Total de Acertos:', totalHits]);
    stats.push(['Média de Acertos:', avgHits]);
    stats.push([]);
    stats.push(['Jackpots (5/5):', jackpots]);
    stats.push(['Muito Bom (4/5):', fourHits]);
    stats.push(['Bom (3/5):', threeHits]);
    stats.push([]);
    stats.push(['Taxa de Acerto:', `${((totalHits / (predictions.length * 5)) * 100).toFixed(1)}%`]);

    const ws2 = XLSX.utils.aoa_to_sheet(stats);
    XLSX.utils.book_append_sheet(wb, ws2, 'Estatísticas');

    // Sheet 3: Como Calcular Manualmente
    const howTo: any[] = [];
    howTo.push(['Como Calcular o Vortex Multi-Canal (2 canais) Manualmente']);
    howTo.push([]);
    howTo.push(['Para cada número candidato (1-50):']);
    howTo.push([]);
    howTo.push(['CANAL 1 (step=1, peso=1.0):']);
    howTo.push(['  1. Diagonal ESQUERDA: número - 1 a cada sorteio (wrap: 1→50)']);
    howTo.push(['  2. Diagonal DIREITA: número + 1 a cada sorteio (wrap: 50→1)']);
    howTo.push(['  3. Conta hits em ambas as direções']);
    howTo.push(['  4. Score Canal 1 = hits × 1.0']);
    howTo.push([]);
    howTo.push(['CANAL 2 (step=2, peso=0.6):']);
    howTo.push(['  1. Diagonal ESQUERDA: número - 2 a cada sorteio (wrap: 1→50)']);
    howTo.push(['  2. Diagonal DIREITA: número + 2 a cada sorteio (wrap: 50→1)']);
    howTo.push(['  3. Conta hits em ambas as direções']);
    howTo.push(['  4. Score Canal 2 = hits × 0.6']);
    howTo.push([]);
    howTo.push(['SCORE FINAL = Score Canal 1 + Score Canal 2']);
    howTo.push([]);
    howTo.push(['Ordenar todos os 50 números por score (maior→menor)']);
    howTo.push(['Top 25 = Predição final']);
    howTo.push([]);
    howTo.push(['Exemplo com número 10:']);
    howTo.push(['Sorteio 1905: 10']);
    howTo.push(['Sorteio 1904: Canal 1: 9,11 | Canal 2: 8,12']);
    howTo.push(['Sorteio 1903: Canal 1: 8,12 | Canal 2: 6,14']);
    howTo.push(['... e assim sucessivamente']);

    const ws3 = XLSX.utils.aoa_to_sheet(howTo);
    ws3['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, ws3, 'Como Calcular');

    // Save file
    const filename = 'Vortex_Analise_100_Sorteios.xlsx';
    XLSX.writeFile(wb, filename);

    console.log(`✅ Excel criado: ${filename}`);
    console.log(`\n📊 Estatísticas:`);
    console.log(`   Total de Sorteios: ${draws.length}`);
    console.log(`   Média de Acertos: ${avgHits}`);
    console.log(`   Jackpots: ${jackpots}`);
    console.log(`   Taxa de Acerto: ${((totalHits / (predictions.length * 5)) * 100).toFixed(1)}%`);

    await prisma.$disconnect();
}

createVortexAnalysisExcel().catch(console.error);
