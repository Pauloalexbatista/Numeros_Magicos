/**
 * Gera Excel com relatório de acertos 4/5 e 5/5
 */

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function generateExcelReport() {
    console.log('📊 GERANDO EXCEL COM RELATÓRIO DE ACERTOS\n');

    // Buscar últimos 50 sorteios
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 50
    });

    console.log(`📅 Processando ${draws.length} sorteios...\n`);

    const excelData: any[] = [];

    for (const draw of draws) {
        const performances = await prisma.systemPerformance.findMany({
            where: {
                drawId: draw.id,
                hits: { gte: 4 }
            },
            orderBy: [
                { hits: 'desc' },
                { systemName: 'asc' }
            ]
        });

        const jackpots = performances.filter(p => p.hits === 5);
        const fourHits = performances.filter(p => p.hits === 4);

        // Números sorteados
        const numbers = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers;

        excelData.push({
            'Data': draw.date.toLocaleDateString('pt-PT'),
            'Sorteio #': draw.id,
            'Números Sorteados': numbers.join(', '),
            'Sistemas 5/5 (Jackpots)': jackpots.length > 0
                ? jackpots.map(j => j.systemName).join(' | ')
                : '-',
            'Qtd Jackpots': jackpots.length,
            'Sistemas 4/5': fourHits.length > 0
                ? fourHits.map(f => f.systemName).join(' | ')
                : '-',
            'Qtd 4 Acertos': fourHits.length,
            'Total ≥4': jackpots.length + fourHits.length
        });
    }

    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Dados principais
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar largura das colunas
    const colWidths = [
        { wch: 12 },  // Data
        { wch: 10 },  // Sorteio #
        { wch: 25 },  // Números Sorteados
        { wch: 80 },  // Sistemas 5/5
        { wch: 12 },  // Qtd Jackpots
        { wch: 80 },  // Sistemas 4/5
        { wch: 12 },  // Qtd 4 Acertos
        { wch: 10 }   // Total ≥4
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Acertos 4 e 5');

    // Sheet 2: Resumo
    const totalJackpots = excelData.reduce((sum, row) => sum + row['Qtd Jackpots'], 0);
    const total4Hits = excelData.reduce((sum, row) => sum + row['Qtd 4 Acertos'], 0);

    const resumo = [
        { 'Métrica': 'Total de Sorteios', 'Valor': draws.length },
        { 'Métrica': 'Total de Jackpots (5/5)', 'Valor': totalJackpots },
        { 'Métrica': 'Total de 4 Acertos', 'Valor': total4Hits },
        { 'Métrica': 'Média Jackpots/Sorteio', 'Valor': (totalJackpots / draws.length).toFixed(2) },
        { 'Métrica': 'Média 4 Acertos/Sorteio', 'Valor': (total4Hits / draws.length).toFixed(2) },
        { 'Métrica': 'Média Total ≥4/Sorteio', 'Valor': ((totalJackpots + total4Hits) / draws.length).toFixed(2) }
    ];

    const wsResumo = XLSX.utils.json_to_sheet(resumo);
    wsResumo['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    // Salvar ficheiro
    const filename = `relatorio_acertos_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);

    console.log(`✅ Excel gerado: ${filename}`);
    console.log(`\n📊 RESUMO:`);
    console.log(`   📁 Ficheiro: ${filename}`);
    console.log(`   📋 Sorteios: ${draws.length}`);
    console.log(`   🏆 Jackpots: ${totalJackpots}`);
    console.log(`   🥈 4 Acertos: ${total4Hits}`);
    console.log(`   📈 Média ≥4/Sorteio: ${((totalJackpots + total4Hits) / draws.length).toFixed(2)}`);

    await prisma.$disconnect();
}

generateExcelReport();
