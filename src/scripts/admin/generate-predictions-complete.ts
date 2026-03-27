/**
 * 📊 EXPORTAÇÃO COMPLETA DE PREVISÕES
 * 
 * Gera Excel com TODAS as previsões de TODOS os sistemas
 * Útil para análise detalhada e comparação entre sistemas
 */

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

async function generatePredictionsExcel() {
    console.log('📊 GERANDO EXCEL COM TODAS AS PREVISÕES\n');

    // Buscar todos os sistemas ativos
    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    console.log(`🎯 ${systems.length} sistemas ativos encontrados\n`);

    // Buscar previsões atuais (cache)
    const predictions = await prisma.cachedPrediction.findMany({
        orderBy: { systemName: 'asc' }
    });

    console.log(`📦 ${predictions.length} previsões em cache\n`);

    // ========================================
    // SHEET 1: PREVISÕES ATUAIS (NÚMEROS)
    // ========================================
    const currentPredictions: any[] = [];

    for (const pred of predictions) {
        const numbers = pred.numbers
            ? (typeof pred.numbers === 'string'
                ? JSON.parse(pred.numbers)
                : pred.numbers as number[])
            : [];

        // Buscar ranking do sistema
        const ranking = await prisma.systemRanking.findFirst({
            where: { systemName: pred.systemName }
        });

        currentPredictions.push({
            'Sistema': pred.systemName,
            'Top 5': numbers.slice(0, 5).join(', '),
            'Top 10': numbers.slice(0, 10).join(', '),
            'Top 15': numbers.slice(0, 15).join(', '),
            'Top 20': numbers.slice(0, 20).join(', '),
            'Top 25': numbers.slice(0, 25).join(', '),
            'Accuracy Média': ranking ? `${ranking.avgAccuracy.toFixed(1)}%` : 'N/A',
            'Total Previsões': ranking?.totalPredictions || 0,
            'Última Atualização': pred.updatedAt?.toLocaleString('pt-PT') || 'N/A'
        });
    }

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(currentPredictions);
    ws1['!cols'] = [
        { wch: 45 },  // Sistema
        { wch: 20 },  // Top 5
        { wch: 30 },  // Top 10
        { wch: 40 },  // Top 15
        { wch: 50 },  // Top 20
        { wch: 60 },  // Top 25
        { wch: 15 },  // Accuracy
        { wch: 15 },  // Total
        { wch: 20 }   // Última Atualização
    ];

    // Auto-filtros
    ws1['!autofilter'] = { ref: 'A1:I1' };

    XLSX.utils.book_append_sheet(wb, ws1, 'Previsões Atuais');

    // ========================================
    // SHEET 2: RANKING DE PERFORMANCE
    // ========================================
    const rankings = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' }
    });

    const rankingData = rankings.map((r, index) => ({
        'Posição': index + 1,
        'Sistema': r.systemName,
        'Accuracy Média': `${r.avgAccuracy.toFixed(2)}%`,
        'Total Previsões': r.totalPredictions,
        'Última Atualização': r.lastUpdated?.toLocaleString('pt-PT') || 'N/A'
    }));

    const ws2 = XLSX.utils.json_to_sheet(rankingData);
    ws2['!cols'] = [
        { wch: 10 }, { wch: 45 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];
    ws2['!autofilter'] = { ref: 'A1:E1' };

    XLSX.utils.book_append_sheet(wb, ws2, 'Ranking Performance');

    // ========================================
    // SHEET 3: ÚLTIMOS 10 SORTEIOS - ACERTOS
    // ========================================
    const recentDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 10
    });

    const acertosData: any[] = [];

    for (const draw of recentDraws) {
        const numbers = typeof draw.numbers === 'string'
            ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers)
            : draw.numbers as number[];

        // Buscar performances deste sorteio
        const performances = await prisma.systemPerformance.findMany({
            where: { drawId: draw.id },
            orderBy: [{ hits: 'desc' }, { systemName: 'asc' }]
        });

        // Agrupar por número de acertos
        const by5 = performances.filter(p => p.hits === 5);
        const by4 = performances.filter(p => p.hits === 4);
        const by3 = performances.filter(p => p.hits === 3);

        acertosData.push({
            'Data': draw.date.toLocaleDateString('pt-PT'),
            'Sorteio #': draw.id,
            'Números Sorteados': numbers.join(', '),
            'Sistemas 5/5': by5.length,
            'Nomes 5/5': by5.length > 0 ? by5.map(p => p.systemName).join(' | ') : '-',
            'Sistemas 4/5': by4.length,
            'Nomes 4/5': by4.length > 0 ? by4.slice(0, 5).map(p => p.systemName).join(' | ') + (by4.length > 5 ? '...' : '') : '-',
            'Sistemas 3/5': by3.length,
            'Total ≥3': by3.length + by4.length + by5.length
        });
    }

    const ws3 = XLSX.utils.json_to_sheet(acertosData);
    ws3['!cols'] = [
        { wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 12 },
        { wch: 80 }, { wch: 12 }, { wch: 80 }, { wch: 12 }, { wch: 12 }
    ];
    ws3['!autofilter'] = { ref: 'A1:I1' };

    XLSX.utils.book_append_sheet(wb, ws3, 'Últimos 10 Sorteios');

    // ========================================
    // SHEET 4: COMPARAÇÃO SISTEMAS (TOP 20)
    // ========================================
    const top20Systems = rankings.slice(0, 20);
    const comparisonData: any[] = [];

    for (const system of top20Systems) {
        // Buscar últimas 100 performances
        const perfs = await prisma.systemPerformance.findMany({
            where: { systemName: system.systemName },
            orderBy: { drawId: 'desc' },
            take: 100
        });

        const hits5 = perfs.filter(p => p.hits === 5).length;
        const hits4 = perfs.filter(p => p.hits === 4).length;
        const hits3 = perfs.filter(p => p.hits === 3).length;
        const totalWins = hits3 + hits4 + hits5;
        const winRate = perfs.length > 0 ? (totalWins / perfs.length) * 100 : 0;

        // Buscar previsão atual
        const pred = predictions.find(p => p.systemName === system.systemName);
        const predNumbers = pred?.numbers
            ? (typeof pred.numbers === 'string'
                ? JSON.parse(pred.numbers)
                : pred.numbers as number[])
            : [];

        comparisonData.push({
            'Sistema': system.systemName,
            'Accuracy': `${system.avgAccuracy.toFixed(1)}%`,
            'Win Rate (3+)': `${winRate.toFixed(1)}%`,
            'Jackpots': hits5,
            '4 Acertos': hits4,
            '3 Acertos': hits3,
            'Total Wins': totalWins,
            'Top 10 Previsão': predNumbers.slice(0, 10).join(', ')
        });
    }

    const ws4 = XLSX.utils.json_to_sheet(comparisonData);
    ws4['!cols'] = [
        { wch: 45 }, { wch: 12 }, { wch: 15 }, { wch: 10 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 35 }
    ];
    ws4['!autofilter'] = { ref: 'A1:H1' };

    XLSX.utils.book_append_sheet(wb, ws4, 'Comparação Top 20');

    // ========================================
    // SHEET 5: RESUMO GERAL
    // ========================================
    const totalSystems = systems.length;
    const activePredictions = predictions.length;
    const avgAccuracy = rankings.reduce((sum, r) => sum + r.avgAccuracy, 0) / rankings.length;

    const resumo = [
        { 'Métrica': 'Data de Geração', 'Valor': new Date().toLocaleString('pt-PT') },
        { 'Métrica': '', 'Valor': '' },
        { 'Métrica': 'Total de Sistemas Ativos', 'Valor': totalSystems },
        { 'Métrica': 'Previsões em Cache', 'Valor': activePredictions },
        { 'Métrica': 'Accuracy Média Global', 'Valor': `${avgAccuracy.toFixed(2)}%` },
        { 'Métrica': '', 'Valor': '' },
        { 'Métrica': 'Melhor Sistema', 'Valor': rankings[0]?.systemName || '-' },
        { 'Métrica': 'Accuracy Melhor Sistema', 'Valor': `${rankings[0]?.avgAccuracy.toFixed(2)}%` || '-' },
        { 'Métrica': '', 'Valor': '' },
        { 'Métrica': 'Total Sorteios Analisados', 'Valor': rankings[0]?.totalPredictions || 0 },
        { 'Métrica': 'Último Sorteio', 'Valor': recentDraws[0]?.date.toLocaleDateString('pt-PT') || '-' }
    ];

    const ws5 = XLSX.utils.json_to_sheet(resumo);
    ws5['!cols'] = [{ wch: 35 }, { wch: 50 }];

    XLSX.utils.book_append_sheet(wb, ws5, 'Resumo');

    // Salvar ficheiro
    const filename = `previsoes_completas_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);

    console.log(`✅ Excel completo gerado: ${filename}\n`);
    console.log(`📊 CONTEÚDO:`);
    console.log(`   📋 Sheet 1: Previsões Atuais (${currentPredictions.length} sistemas)`);
    console.log(`   🏆 Sheet 2: Ranking de Performance (${rankingData.length} sistemas)`);
    console.log(`   📅 Sheet 3: Últimos 10 Sorteios`);
    console.log(`   🔍 Sheet 4: Comparação Top 20 Sistemas`);
    console.log(`   📈 Sheet 5: Resumo Geral`);
    console.log(`\n🎯 ESTATÍSTICAS:`);
    console.log(`   🎲 Sistemas Ativos: ${totalSystems}`);
    console.log(`   📦 Previsões em Cache: ${activePredictions}`);
    console.log(`   📊 Accuracy Média: ${avgAccuracy.toFixed(2)}%`);
    console.log(`   🥇 Melhor Sistema: ${rankings[0]?.systemName || '-'} (${rankings[0]?.avgAccuracy.toFixed(2)}%)`);

    await prisma.$disconnect();
}

generatePredictionsExcel().catch(console.error);
