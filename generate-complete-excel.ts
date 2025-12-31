/**
 * Gera Excel COMPLETO com números E estrelas
 */

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

async function generateCompleteExcel() {
    console.log('📊 GERANDO EXCEL COMPLETO (Números + Estrelas)\n');

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 50
    });

    console.log(`📅 Processando ${draws.length} sorteios...\n`);

    const excelData: any[] = [];

    for (const draw of draws) {
        // Performances de NÚMEROS
        const numPerformances = await prisma.systemPerformance.findMany({
            where: {
                drawId: draw.id,
                hits: { gte: 4 }
            },
            orderBy: [{ hits: 'desc' }, { systemName: 'asc' }]
        });

        const numJackpots = numPerformances.filter(p => p.hits === 5);
        const num4Hits = numPerformances.filter(p => p.hits === 4);

        // Números e estrelas sorteados
        const numbers = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers;

        const stars = typeof draw.stars === 'string'
            ? JSON.parse(draw.stars)
            : draw.stars;

        excelData.push({
            'Data': draw.date.toLocaleDateString('pt-PT'),
            'Sorteio #': draw.id,
            'Números': numbers.join(', '),
            'Estrelas': stars.join(', '),
            'Sistemas 5/5 Números': numJackpots.length > 0
                ? numJackpots.map(j => j.systemName).join(' | ')
                : '-',
            'Qtd JP Números': numJackpots.length,
            'Sistemas 4/5 Números': num4Hits.length > 0
                ? num4Hits.map(f => f.systemName).join(' | ')
                : '-',
            'Qtd 4/5 Números': num4Hits.length,
            'Total ≥4 Números': numJackpots.length + num4Hits.length
        });
    }

    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Dados completos
    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = [
        { wch: 12 },  // Data
        { wch: 10 },  // Sorteio #
        { wch: 25 },  // Números
        { wch: 10 },  // Estrelas
        { wch: 80 },  // Sistemas 5/5
        { wch: 12 },  // Qtd JP
        { wch: 80 },  // Sistemas 4/5
        { wch: 12 },  // Qtd 4/5
        { wch: 10 }   // Total ≥4
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Acertos Completos');

    // Sheet 2: Análise de Frequência de Sistemas
    const systemFrequency = new Map<string, { jp: number, four: number }>();

    for (const draw of draws) {
        const perfs = await prisma.systemPerformance.findMany({
            where: { drawId: draw.id, hits: { gte: 4 } }
        });

        perfs.forEach(p => {
            if (!systemFrequency.has(p.systemName)) {
                systemFrequency.set(p.systemName, { jp: 0, four: 0 });
            }
            const freq = systemFrequency.get(p.systemName)!;
            if (p.hits === 5) freq.jp++;
            else if (p.hits === 4) freq.four++;
        });
    }

    const freqData = Array.from(systemFrequency.entries())
        .map(([name, counts]) => ({
            'Sistema': name,
            'Jackpots (5/5)': counts.jp,
            '4 Acertos': counts.four,
            'Total ≥4': counts.jp + counts.four,
            '% Jackpots': ((counts.jp / draws.length) * 100).toFixed(1) + '%',
            '% 4 Acertos': ((counts.four / draws.length) * 100).toFixed(1) + '%'
        }))
        .sort((a, b) => b['Total ≥4'] - a['Total ≥4']);

    const wsFreq = XLSX.utils.json_to_sheet(freqData);
    wsFreq['!cols'] = [
        { wch: 50 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsFreq, 'Ranking Sistemas');

    // Sheet 3: Resumo
    const totalJP = excelData.reduce((sum, row) => sum + row['Qtd JP Números'], 0);
    const total4 = excelData.reduce((sum, row) => sum + row['Qtd 4/5 Números'], 0);

    const resumo = [
        { 'Métrica': 'Total de Sorteios Analisados', 'Valor': draws.length },
        { 'Métrica': 'Total de Jackpots (5/5)', 'Valor': totalJP },
        { 'Métrica': 'Total de 4 Acertos', 'Valor': total4 },
        { 'Métrica': 'Média Jackpots por Sorteio', 'Valor': (totalJP / draws.length).toFixed(2) },
        { 'Métrica': 'Média 4 Acertos por Sorteio', 'Valor': (total4 / draws.length).toFixed(2) },
        { 'Métrica': 'Média Total ≥4 por Sorteio', 'Valor': ((totalJP + total4) / draws.length).toFixed(2) },
        { 'Métrica': '', 'Valor': '' },
        { 'Métrica': 'Sistema com Mais Jackpots', 'Valor': freqData[0]?.Sistema || '-' },
        { 'Métrica': 'Jackpots desse Sistema', 'Valor': freqData[0]?.['Jackpots (5/5)'] || 0 }
    ];

    const wsResumo = XLSX.utils.json_to_sheet(resumo);
    wsResumo['!cols'] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    // Salvar
    const filename = `relatorio_completo_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);

    console.log(`✅ Excel completo gerado: ${filename}`);
    console.log(`\n📊 CONTEÚDO:`);
    console.log(`   📋 Sheet 1: Dados completos (números + estrelas)`);
    console.log(`   🏆 Sheet 2: Ranking de sistemas por frequência`);
    console.log(`   📈 Sheet 3: Resumo estatístico`);
    console.log(`\n🎯 TOP 5 SISTEMAS:`);
    freqData.slice(0, 5).forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.Sistema}: ${s['Jackpots (5/5)']} JP + ${s['4 Acertos']} x4 = ${s['Total ≥4']} total`);
    });

    await prisma.$disconnect();
}

generateCompleteExcel();
