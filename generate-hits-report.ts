/**
 * RELATÓRIO: Sistemas com 4 ou 5 acertos por sorteio
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function generateReport() {
    console.log('📊 GERANDO RELATÓRIO DE ACERTOS 4/5 E 5/5\n');

    // Buscar todos os sorteios (últimos 50 para não ficar muito grande)
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 50
    });

    console.log(`📅 Analisando ${draws.length} sorteios...\n`);

    let report = '# 🏆 RELATÓRIO: Sistemas com 4 ou 5 Acertos por Sorteio\n\n';
    report += `**Total de Sorteios Analisados:** ${draws.length}\n`;
    report += `**Data de Geração:** ${new Date().toLocaleDateString('pt-PT')}\n\n`;
    report += '---\n\n';

    let totalJackpots = 0;
    let total4Hits = 0;

    for (const draw of draws) {
        const performances = await prisma.systemPerformance.findMany({
            where: {
                drawId: draw.id,
                hits: { gte: 4 } // 4 ou 5 acertos
            },
            orderBy: [
                { hits: 'desc' },
                { systemName: 'asc' }
            ]
        });

        if (performances.length === 0) continue;

        const jackpots = performances.filter(p => p.hits === 5);
        const fourHits = performances.filter(p => p.hits === 4);

        totalJackpots += jackpots.length;
        total4Hits += fourHits.length;

        // Números sorteados
        const numbers = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers;

        report += `## Sorteio #${draw.id} - ${draw.date.toLocaleDateString('pt-PT')}\n\n`;
        report += `**Números:** ${numbers.join(', ')}\n\n`;

        if (jackpots.length > 0) {
            report += `### 🎉 JACKPOTS (5/5) - ${jackpots.length} sistema(s)\n\n`;
            jackpots.forEach((jp, idx) => {
                report += `${idx + 1}. **${jp.systemName}**\n`;
            });
            report += '\n';
        }

        if (fourHits.length > 0) {
            report += `### 🥈 4 ACERTOS - ${fourHits.length} sistema(s)\n\n`;
            fourHits.forEach((hit, idx) => {
                report += `${idx + 1}. ${hit.systemName}\n`;
            });
            report += '\n';
        }

        report += '---\n\n';
    }

    // Resumo final
    report += '## 📊 RESUMO GERAL\n\n';
    report += `- **Total de Jackpots (5/5):** ${totalJackpots}\n`;
    report += `- **Total de 4 Acertos:** ${total4Hits}\n`;
    report += `- **Média de Jackpots por Sorteio:** ${(totalJackpots / draws.length).toFixed(2)}\n`;
    report += `- **Média de 4 Acertos por Sorteio:** ${(total4Hits / draws.length).toFixed(2)}\n`;

    // Salvar relatório
    const filename = `relatorio_acertos_${new Date().toISOString().split('T')[0]}.md`;
    fs.writeFileSync(filename, report);

    console.log(`✅ Relatório gerado: ${filename}`);
    console.log(`\n📊 RESUMO:`);
    console.log(`   🏆 Total de Jackpots: ${totalJackpots}`);
    console.log(`   🥈 Total de 4 Acertos: ${total4Hits}`);
    console.log(`   📈 Média Jackpots/Sorteio: ${(totalJackpots / draws.length).toFixed(2)}`);
    console.log(`   📈 Média 4 Acertos/Sorteio: ${(total4Hits / draws.length).toFixed(2)}`);

    await prisma.$disconnect();
}

generateReport();
