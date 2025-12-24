/**
 * COMPARE PREDICTIONS WITH RESULTS
 * Compara previsões exportadas com resultados reais
 */

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PredictionResult {
    sistema: string;
    previsao: number[];
    resultado: number[];
    acertos: number;
    acertou5: boolean;
    acertou4: boolean;
    acertou3: boolean;
}

async function comparePredictions(excelFilePath: string, drawId?: number) {
    console.log('📊 COMPARAÇÃO DE PREVISÕES\n');

    // Ler ficheiro Excel
    if (!fs.existsSync(excelFilePath)) {
        throw new Error(`Ficheiro não encontrado: ${excelFilePath}`);
    }

    const workbook = XLSX.readFile(excelFilePath);
    const sheet = workbook.Sheets['Previsões Completas'] || workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`📁 Ficheiro: ${path.basename(excelFilePath)}`);
    console.log(`📊 ${data.length} sistemas no ficheiro\n`);

    // Buscar último sorteio ou sorteio específico
    const draw = drawId
        ? await prisma.draw.findUnique({ where: { id: drawId } })
        : await prisma.draw.findFirst({ orderBy: { date: 'desc' } });

    if (!draw) {
        throw new Error('Sorteio não encontrado');
    }

    const drawnNumbers = typeof draw.numbers === 'string'
        ? JSON.parse(draw.numbers)
        : draw.numbers as number[];

    console.log(`🎯 Sorteio #${draw.id} - ${new Date(draw.date).toLocaleDateString('pt-PT')}`);
    console.log(`🎲 Números: ${drawnNumbers.join(', ')}\n`);

    // Comparar cada sistema
    const results: PredictionResult[] = [];

    for (const row of data as any[]) {
        const sistema = row['Sistema'];
        const previsaoStr = row['Previsão (25 números)'];

        if (!previsaoStr) continue;

        const previsao = previsaoStr.split(',').map((n: string) => parseInt(n.trim()));
        const acertos = drawnNumbers.filter(n => previsao.includes(n)).length;

        results.push({
            sistema,
            previsao,
            resultado: drawnNumbers,
            acertos,
            acertou5: acertos === 5,
            acertou4: acertos === 4,
            acertou3: acertos === 3
        });
    }

    // Ordenar por acertos
    results.sort((a, b) => b.acertos - a.acertos);

    // Mostrar resultados
    console.log('═'.repeat(80));
    console.log('RESULTADOS DA COMPARAÇÃO\n');

    const jackpots = results.filter(r => r.acertou5);
    const quatro = results.filter(r => r.acertou4);
    const tres = results.filter(r => r.acertou3);

    console.log(`🎉 Jackpots (5 acertos): ${jackpots.length}`);
    jackpots.forEach(r => console.log(`   ✅ ${r.sistema}`));

    console.log(`\n🎯 4 Acertos: ${quatro.length}`);
    quatro.forEach(r => console.log(`   ✅ ${r.sistema}`));

    console.log(`\n🎲 3 Acertos: ${tres.length}`);
    tres.forEach(r => console.log(`   ✅ ${r.sistema}`));

    console.log('\n═'.repeat(80));
    console.log('TOP 10 SISTEMAS:\n');

    results.slice(0, 10).forEach((r, idx) => {
        const emoji = r.acertos === 5 ? '🏆' : r.acertos === 4 ? '🥈' : r.acertos === 3 ? '🥉' : '📊';
        console.log(`${idx + 1}. ${emoji} ${r.sistema}: ${r.acertos} acertos`);
    });

    // Criar Excel com resultados
    const outputPath = excelFilePath.replace('.xlsx', '_RESULTADOS.xlsx');

    const resultsData = results.map(r => ({
        'Sistema': r.sistema,
        'Acertos': r.acertos,
        'Jackpot (5)': r.acertou5 ? 'SIM' : 'NÃO',
        '4 Acertos': r.acertou4 ? 'SIM' : 'NÃO',
        '3 Acertos': r.acertou3 ? 'SIM' : 'NÃO',
        'Previsão': r.previsao.join(', '),
        'Resultado Real': r.resultado.join(', ')
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(resultsData);

    ws['!cols'] = [
        { wch: 40 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 60 },
        { wch: 30 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
    XLSX.writeFile(wb, outputPath);

    console.log(`\n✅ Resultados guardados em: ${outputPath}\n`);

    await prisma.$disconnect();

    return {
        totalSistemas: results.length,
        jackpots: jackpots.length,
        quatroAcertos: quatro.length,
        tresAcertos: tres.length,
        top10: results.slice(0, 10),
        outputPath
    };
}

// Executar se chamado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const excelPath = args[0];
    const drawId = args[1] ? parseInt(args[1]) : undefined;

    if (!excelPath) {
        console.error('❌ Uso: npx tsx compare-predictions.ts <caminho-excel> [drawId]');
        process.exit(1);
    }

    comparePredictions(excelPath, drawId)
        .then(result => {
            console.log('🎉 COMPARAÇÃO CONCLUÍDA!\n');
            console.log(`📊 Total: ${result.totalSistemas} sistemas`);
            console.log(`🏆 Jackpots: ${result.jackpots}`);
            console.log(`🥈 4 Acertos: ${result.quatroAcertos}`);
            console.log(`🥉 3 Acertos: ${result.tresAcertos}`);
        })
        .catch(error => {
            console.error('❌ Erro:', error);
            process.exit(1);
        });
}

export { comparePredictions };
