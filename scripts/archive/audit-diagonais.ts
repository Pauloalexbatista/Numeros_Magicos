import { PrismaClient } from '@prisma/client';
import { DiagonaisMatrizSystem } from '../src/services/diagonais-matriz';

const prisma = new PrismaClient();

async function auditGame(game: 'TOTOLOTO' | 'EURODREAMS' | 'EUROMILLIONS' | 'MEGASENA') {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 AUDITING: ${game} - Diagonais da Matriz`);
    console.log(`${'='.repeat(60)}`);

    const records = await prisma.systemPrediction.findMany({
        where: { game, systemName: 'Diagonais da Matriz', domain: 'NUMBERS' },
        orderBy: { draw: { date: 'desc' } },
        take: 50,
        include: { draw: true }
    });

    if (records.length === 0) {
        console.log(`⚠️ Nenhum registo encontrado para ${game}`);
        return;
    }

    // 1. Check uniqueness
    const predStrings = records.map(r => r.prediction);
    const uniqueCount = new Set(predStrings).size;
    let consecutiveIdentical = 0;
    for (let i = 0; i < predStrings.length - 1; i++) {
        if (predStrings[i] === predStrings[i + 1]) consecutiveIdentical++;
    }

    console.log(`📊 Últimos 50 Sorteios:`);
    console.log(`   • Previsões Únicas: ${uniqueCount} / ${records.length}`);
    console.log(`   • Repetições Consecutivas: ${consecutiveIdentical}`);

    if (uniqueCount === records.length) {
        console.log(`   ✅ SUCESSO: Todas as previsões são 100% orgânicas e distintas!`);
    } else {
        console.log(`   🚨 ALERTA: Existem previsões repetidas no histórico!`);
    }

    // 2. Sample Verification (Recalculate 3 random draws from scratch)
    console.log(`\n🧪 Verificação Pontual de Integridade (Recálculo puro):`);
    const system = new DiagonaisMatrizSystem();
    const testIndices = [0, Math.floor(records.length / 2), records.length - 1];

    for (const idx of testIndices) {
        const rec = records[idx];
        const drawDate = rec.draw.date.toISOString().split('T')[0];

        // Fetch history strictly before this draw
        const history = await prisma.draw.findMany({
            where: {
                game,
                date: { lt: rec.draw.date }
            },
            orderBy: { date: 'desc' }
        });

        const recalculated = await system.generateTop10(history, true);
        const stored = typeof rec.prediction === 'string' ? JSON.parse(rec.prediction) : rec.prediction;

        const isMatch = JSON.stringify(recalculated) === JSON.stringify(stored);

        if (isMatch) {
            console.log(`   ✅ Sorteio [${drawDate}]: Match 100% exato (${recalculated.length} números verificados)`);
        } else {
            console.log(`   ❌ Sorteio [${drawDate}]: DISCREPÂNCIA DETETADA!`);
            console.log(`      Gravado:       [${stored.slice(0, 5).join(',')}]`);
            console.log(`      Recalculado:   [${recalculated.slice(0, 5).join(',')}]`);
        }
    }
}

async function main() {
    console.log("🐕 WATCHDOG AUDIT: Diagonais da Matriz");
    const games = ['TOTOLOTO', 'EURODREAMS', 'EUROMILLIONS', 'MEGASENA'] as const;
    for (const g of games) {
        await auditGame(g);
    }
}

main().finally(() => prisma.$disconnect());
