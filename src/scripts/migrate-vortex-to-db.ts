import { prisma } from '@/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Migrate Vortex predictions from JSON file to database
 */

interface VortexPrediction {
    drawId: number;
    date: string;
    actualNumbers: number[];
    vortexPrediction: number[];
    antiVortexPrediction: number[];
    vortexHits: number;
    antiVortexHits: number;
    vortexJackpot: boolean;
    antiVortexJackpot: boolean;
}

async function migrateVortexToDb() {
    console.log('📦 MIGRAÇÃO: Vortex Pyramid (JSON → BD)\n');
    console.log('═'.repeat(80));

    // Load JSON data
    const dataPath = path.join(process.cwd(), 'data', 'vortex-predictions.json');

    if (!fs.existsSync(dataPath)) {
        console.log('❌ Ficheiro vortex-predictions.json não encontrado!');
        return;
    }

    const data: VortexPrediction[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`📁 Carregados ${data.length} registos do JSON\n`);

    // Clear existing Vortex predictions
    await prisma.systemPrediction.deleteMany({
        where: { systemName: 'Vortex Pyramid' }
    });
    await prisma.systemPrediction.deleteMany({
        where: { systemName: 'Anti-Vortex Pyramid' }
    });

    console.log('🗑️  Registos antigos removidos\n');
    console.log('💾 Inserindo na BD...\n');

    let inserted = 0;
    const batchSize = 100;

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        // Insert Vortex predictions
        await prisma.systemPrediction.createMany({
            data: batch.map(p => ({
                drawId: p.drawId,
                systemName: 'Vortex Pyramid',
                prediction: JSON.stringify(p.vortexPrediction),
                antiPrediction: JSON.stringify(p.antiVortexPrediction),
                hits: p.vortexHits,
                antiHits: p.antiVortexHits,
                jackpot: p.vortexJackpot,
                antiJackpot: p.antiVortexJackpot
            }))
        });

        // Insert Anti-Vortex predictions (as separate system)
        await prisma.systemPrediction.createMany({
            data: batch.map(p => ({
                drawId: p.drawId,
                systemName: 'Anti-Vortex Pyramid',
                prediction: JSON.stringify(p.antiVortexPrediction),
                antiPrediction: JSON.stringify(p.vortexPrediction),
                hits: p.antiVortexHits,
                antiHits: p.vortexHits,
                jackpot: p.antiVortexJackpot,
                antiJackpot: p.vortexJackpot
            }))
        });

        inserted += batch.length;
        console.log(`Inseridos: ${inserted}/${data.length} (${((inserted / data.length) * 100).toFixed(1)}%)`);
    }

    console.log('\n✅ Migração concluída!\n');

    // Verify
    const vortexCount = await prisma.systemPrediction.count({
        where: { systemName: 'Vortex Pyramid' }
    });
    const antiVortexCount = await prisma.systemPrediction.count({
        where: { systemName: 'Anti-Vortex Pyramid' }
    });

    console.log('📊 VERIFICAÇÃO\n');
    console.log(`Vortex Pyramid: ${vortexCount} registos`);
    console.log(`Anti-Vortex Pyramid: ${antiVortexCount} registos`);

    // Quick stats
    const vortexJackpots = await prisma.systemPrediction.count({
        where: { systemName: 'Vortex Pyramid', jackpot: true }
    });
    const antiVortexJackpots = await prisma.systemPrediction.count({
        where: { systemName: 'Anti-Vortex Pyramid', jackpot: true }
    });

    console.log(`\nVortex Jackpots: ${vortexJackpots}`);
    console.log(`Anti-Vortex Jackpots: ${antiVortexJackpots}`);

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Vortex Pyramid migrado com sucesso!');
    console.log('   Agora as análises serão INSTANTÂNEAS da BD!');
}

migrateVortexToDb()
    .then(() => {
        console.log('\n✅ Migração concluída!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
