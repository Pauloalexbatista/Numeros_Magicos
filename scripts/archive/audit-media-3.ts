import { PrismaClient } from '@prisma/client';
import { SistMedia3Otimizado } from '../src/services/custom/SistMedia3Otimizado';

const prisma = new PrismaClient();

async function auditGame(game: 'TOTOLOTO' | 'EURODREAMS' | 'EUROMILLIONS' | 'MEGASENA') {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 AUDITING: ${game} - Sistema Média +3 Otimizado`);
    console.log(`${'='.repeat(60)}`);

    const records = await prisma.systemPrediction.findMany({
        where: { game, systemName: 'Sistema Média +3 Otimizado', domain: 'NUMBERS' },
        orderBy: { draw: { date: 'desc' } },
        take: 50,
        include: { draw: true }
    });

    if (records.length === 0) {
        console.log(`❌ Nenhum registo encontrado para ${game}`);
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
        console.log(`   ⚠️ ALERTA: Existem previsões repetidas no histórico!`);
    }

    // 2. Sample Verification (Recalculate 3 random draws from scratch)
    console.log(`\n🧪 Verificação Pontual de Integridade (Recálculo puro):`);
    const system = new SistMedia3Otimizado();
    const testIndices = [0, Math.floor(records.length / 2), records.length - 1];

    for (const idx of testIndices) {
        const rec = records[idx];
        const drawDate = rec.draw.date.toISOString().split('T')[0];

        // Fetch history strictly before this draw
        const priorHistory = await prisma.draw.findMany({
            where: {
                game,
                date: { lt: rec.draw.date }
            },
            orderBy: { date: 'desc' },
            take: 50
        });

        if (priorHistory.length < 50) {
            console.log(`   ⏭️ Sorteio [${drawDate}]: Histórico menor que 50 (ignorado)`);
            continue;
        }

        const freshPred = await system.generateTop10(priorHistory, true);
        const storedPred: number[] = JSON.parse(rec.prediction);

        const isMatch = JSON.stringify(freshPred) === JSON.stringify(storedPred);
        if (isMatch) {
            console.log(`   ✅ Sorteio [${drawDate}]: Match 100% exato (${freshPred.length} números verificados)`);
        } else {
            console.log(`   ❌ Sorteio [${drawDate}]: Divergência detectada!`);
            console.log(`      Guardado: ${JSON.stringify(storedPred.slice(0, 10))}`);
            console.log(`      Recalculado: ${JSON.stringify(freshPred.slice(0, 10))}`);
        }
    }
}

async function main() {
    console.log(`🐕 WATCHDOG AUDIT: Sistema Média +3 Otimizado`);
    await auditGame('TOTOLOTO');
    await auditGame('EURODREAMS');
    await auditGame('EUROMILLIONS');
    await auditGame('MEGASENA');
}

main().finally(() => prisma.$disconnect());
