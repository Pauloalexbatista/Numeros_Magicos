/**
 * 🔍 VALIDAÇÃO TEMPORAL DE PREVISÕES
 * 
 * Gera Excel com validação temporal mostrando:
 * - Números sorteados em cada draw
 * - Previsão que foi feita ANTES desse draw
 * - Quantos acertos teve
 * - Próxima previsão (para validar que muda)
 * 
 * Objetivo: Confirmar que cálculos estão corretos e não há "fugas de informação"
 */

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

// Cores para formatação
const COLORS = {
    HEADER: 'FF4472C4',      // Azul
    JACKPOT: 'FF00B050',     // Verde
    FOUR_HITS: 'FFFFC000',   // Amarelo
    THREE_HITS: 'FFFFA500',  // Laranja
    MISS: 'FFFF6B6B'         // Vermelho claro
};

interface ValidationRow {
    data: string;
    sorteio: number;
    numerossorteados: string;
    estrelassorteadas: string;
    sistema: string;
    previsaoFeita: string;
    previsaoFeitaEm: string;
    acertosNumeros: number;
    acertosEstrelas: number;
    accuracyNumeros: string;
    proximaPrevisao: string;
    proximaPrevisaoEm: string;
}

async function generateValidationExcel() {
    console.log('🔍 GERANDO VALIDAÇÃO TEMPORAL DE PREVISÕES\n');

    // Buscar últimos 20 sorteios (para não ficar muito pesado)
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 20
    });

    console.log(`📅 Analisando ${draws.length} sorteios...\n`);

    // Buscar top 10 sistemas por performance
    const topSystems = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 10,
        select: { systemName: true }
    });

    console.log(`🏆 Top ${topSystems.length} sistemas selecionados\n`);

    const validationData: ValidationRow[] = [];

    for (const draw of draws) {
        const numbers = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers as number[];

        const stars = typeof draw.stars === 'string'
            ? JSON.parse(draw.stars)
            : draw.stars as number[];

        for (const system of topSystems) {
            // 1. Buscar previsão feita ANTES deste sorteio
            const prediction = await prisma.systemPrediction.findFirst({
                where: {
                    drawId: draw.id,
                    systemName: system.systemName
                }
            });

            // 2. Buscar performance (acertos)
            const performance = await prisma.systemPerformance.findFirst({
                where: {
                    drawId: draw.id,
                    systemName: system.systemName
                }
            });

            // 3. Buscar próxima previsão (cache atual)
            const nextPrediction = await prisma.cachedPrediction.findFirst({
                where: { systemName: system.systemName },
                orderBy: { updatedAt: 'desc' }
            });

            if (!prediction || !performance) continue;

            const predictedNumbers = typeof prediction.prediction === 'string'
                ? JSON.parse(prediction.prediction)
                : prediction.prediction as number[];

            const nextNumbers = nextPrediction?.numbers
                ? (typeof nextPrediction.numbers === 'string'
                    ? JSON.parse(nextPrediction.numbers)
                    : nextPrediction.numbers as number[])
                : [];

            validationData.push({
                data: draw.date.toLocaleDateString('pt-PT'),
                sorteio: draw.id,
                numerossorteados: numbers.join(', '),
                estrelassorteadas: stars.join(', '),
                sistema: system.systemName,
                previsaoFeita: predictedNumbers.slice(0, 10).join(', '),
                previsaoFeitaEm: prediction.calculatedAt?.toLocaleString('pt-PT') || 'N/A',
                acertosNumeros: performance.hits,
                acertosEstrelas: 0, // TODO: adicionar quando tivermos estrelas
                accuracyNumeros: `${performance.accuracy.toFixed(1)}%`,
                proximaPrevisao: nextNumbers.slice(0, 10).join(', '),
                proximaPrevisaoEm: nextPrediction?.updatedAt?.toLocaleString('pt-PT') || 'N/A'
            });
        }
    }

    console.log(`📊 Total de registos: ${validationData.length}\n`);

    // Criar workbook
    const wb = XLSX.utils.book_new();

    // ========================================
    // SHEET 1: VALIDAÇÃO TEMPORAL (NÚMEROS)
    // ========================================
    const ws1 = XLSX.utils.json_to_sheet(validationData, {
        header: [
            'data', 'sorteio', 'numerossorteados', 'estrelassorteadas',
            'sistema', 'previsaoFeita', 'previsaoFeitaEm',
            'acertosNumeros', 'accuracyNumeros',
            'proximaPrevisao', 'proximaPrevisaoEm'
        ]
    });

    // Renomear headers
    ws1['A1'].v = 'Data';
    ws1['B1'].v = 'Sorteio #';
    ws1['C1'].v = 'Números Sorteados';
    ws1['D1'].v = 'Estrelas Sorteadas';
    ws1['E1'].v = 'Sistema';
    ws1['F1'].v = 'Previsão Feita (Top 10)';
    ws1['G1'].v = 'Previsão Feita Em';
    ws1['H1'].v = 'Acertos';
    ws1['I1'].v = 'Accuracy';
    ws1['J1'].v = 'Próxima Previsão (Top 10)';
    ws1['K1'].v = 'Próxima Previsão Em';

    // Largura das colunas
    ws1['!cols'] = [
        { wch: 12 },  // Data
        { wch: 10 },  // Sorteio
        { wch: 30 },  // Números Sorteados
        { wch: 15 },  // Estrelas
        { wch: 40 },  // Sistema
        { wch: 35 },  // Previsão Feita
        { wch: 20 },  // Previsão Feita Em
        { wch: 10 },  // Acertos
        { wch: 10 },  // Accuracy
        { wch: 35 },  // Próxima Previsão
        { wch: 20 }   // Próxima Previsão Em
    ];

    // Auto-filtros
    ws1['!autofilter'] = { ref: 'A1:K1' };

    XLSX.utils.book_append_sheet(wb, ws1, 'Validação Temporal');

    // ========================================
    // SHEET 2: ANÁLISE DE CONSISTÊNCIA
    // ========================================
    const consistencyData: any[] = [];

    for (const system of topSystems) {
        const systemData = validationData.filter(v => v.sistema === system.systemName);

        if (systemData.length === 0) continue;

        const totalAcertos = systemData.reduce((sum, v) => sum + v.acertosNumeros, 0);
        const avgAcertos = totalAcertos / systemData.length;
        const jackpots = systemData.filter(v => v.acertosNumeros === 5).length;
        const fourHits = systemData.filter(v => v.acertosNumeros === 4).length;
        const threeHits = systemData.filter(v => v.acertosNumeros === 3).length;

        // Verificar se previsões mudam
        const predictions = systemData.map(v => v.previsaoFeita);
        const uniquePredictions = new Set(predictions);
        const predictionVariety = (uniquePredictions.size / predictions.length) * 100;

        consistencyData.push({
            'Sistema': system.systemName,
            'Sorteios Analisados': systemData.length,
            'Média Acertos': avgAcertos.toFixed(2),
            'Jackpots (5/5)': jackpots,
            '4 Acertos': fourHits,
            '3 Acertos': threeHits,
            'Win Rate (3+)': `${(((threeHits + fourHits + jackpots) / systemData.length) * 100).toFixed(1)}%`,
            'Variedade Previsões': `${predictionVariety.toFixed(1)}%`,
            'Status': predictionVariety > 80 ? '✅ OK' : '⚠️ Baixa Variedade'
        });
    }

    const ws2 = XLSX.utils.json_to_sheet(consistencyData);
    ws2['!cols'] = [
        { wch: 40 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
        { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws2, 'Análise Consistência');

    // ========================================
    // SHEET 3: RESUMO ESTATÍSTICO
    // ========================================
    const totalJackpots = validationData.filter(v => v.acertosNumeros === 5).length;
    const total4Hits = validationData.filter(v => v.acertosNumeros === 4).length;
    const total3Hits = validationData.filter(v => v.acertosNumeros === 3).length;
    const totalWins = total3Hits + total4Hits + totalJackpots;

    const resumo = [
        { 'Métrica': 'Período Analisado', 'Valor': `${draws[draws.length - 1].date.toLocaleDateString('pt-PT')} a ${draws[0].date.toLocaleDateString('pt-PT')}` },
        { 'Métrica': 'Total de Sorteios', 'Valor': draws.length },
        { 'Métrica': 'Sistemas Analisados', 'Valor': topSystems.length },
        { 'Métrica': 'Total de Registos', 'Valor': validationData.length },
        { 'Métrica': '', 'Valor': '' },
        { 'Métrica': 'Total Jackpots (5/5)', 'Valor': totalJackpots },
        { 'Métrica': 'Total 4 Acertos', 'Valor': total4Hits },
        { 'Métrica': 'Total 3 Acertos', 'Valor': total3Hits },
        { 'Métrica': 'Total Wins (3+)', 'Valor': totalWins },
        { 'Métrica': '', 'Valor': '' },
        { 'Métrica': 'Win Rate Global (3+)', 'Valor': `${((totalWins / validationData.length) * 100).toFixed(1)}%` },
        { 'Métrica': 'Média Jackpots/Sorteio', 'Valor': (totalJackpots / draws.length).toFixed(2) },
        { 'Métrica': 'Média 4 Acertos/Sorteio', 'Valor': (total4Hits / draws.length).toFixed(2) },
        { 'Métrica': '', 'Valor': '' },
        { 'Métrica': 'Melhor Sistema', 'Valor': consistencyData[0]?.Sistema || '-' },
        { 'Métrica': 'Win Rate Melhor Sistema', 'Valor': consistencyData[0]?.['Win Rate (3+)'] || '-' }
    ];

    const ws3 = XLSX.utils.json_to_sheet(resumo);
    ws3['!cols'] = [{ wch: 35 }, { wch: 50 }];

    XLSX.utils.book_append_sheet(wb, ws3, 'Resumo');

    // ========================================
    // SHEET 4: TIMELINE DE PREVISÕES
    // ========================================
    // Mostrar evolução das previsões de um sistema ao longo do tempo
    const timelineSystem = topSystems[0].systemName;
    const timelineData = validationData
        .filter(v => v.sistema === timelineSystem)
        .map(v => ({
            'Data': v.data,
            'Sorteio': v.sorteio,
            'Números Sorteados': v.numerossorteados,
            'Previsão Feita': v.previsaoFeita,
            'Acertos': v.acertosNumeros,
            'Accuracy': v.accuracyNumeros,
            'Próxima Previsão': v.proximaPrevisao
        }));

    const ws4 = XLSX.utils.json_to_sheet(timelineData);
    ws4['!cols'] = [
        { wch: 12 }, { wch: 10 }, { wch: 30 },
        { wch: 35 }, { wch: 10 }, { wch: 10 }, { wch: 35 }
    ];

    XLSX.utils.book_append_sheet(wb, ws4, `Timeline ${timelineSystem.substring(0, 20)}`);

    // Salvar ficheiro
    const filename = `validacao_temporal_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);

    console.log(`✅ Excel de validação gerado: ${filename}\n`);
    console.log(`📊 CONTEÚDO:`);
    console.log(`   📋 Sheet 1: Validação Temporal (${validationData.length} registos)`);
    console.log(`   🔍 Sheet 2: Análise de Consistência (${consistencyData.length} sistemas)`);
    console.log(`   📈 Sheet 3: Resumo Estatístico`);
    console.log(`   ⏱️  Sheet 4: Timeline de Previsões (${timelineSystem})`);
    console.log(`\n🎯 RESUMO:`);
    console.log(`   📅 Período: ${draws[draws.length - 1].date.toLocaleDateString('pt-PT')} a ${draws[0].date.toLocaleDateString('pt-PT')}`);
    console.log(`   🏆 Jackpots: ${totalJackpots}`);
    console.log(`   🥈 4 Acertos: ${total4Hits}`);
    console.log(`   🥉 3 Acertos: ${total3Hits}`);
    console.log(`   📊 Win Rate Global: ${((totalWins / validationData.length) * 100).toFixed(1)}%`);

    await prisma.$disconnect();
}

generateValidationExcel().catch(console.error);
