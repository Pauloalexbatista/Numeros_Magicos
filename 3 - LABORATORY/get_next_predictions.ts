
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:../../prisma/dev.db'
        }
    },
    log: []
});

async function main() {
    // 1. Determine Target Draw
    const lastPred = await prisma.systemPrediction.findFirst({
        orderBy: { drawId: 'desc' }
    });

    if (!lastPred) {
        console.log('No predictions found in DB.');
        return;
    }

    const targetDrawId = lastPred.drawId;
    console.log(`\n🎯 TARGET DRAW: ${targetDrawId}`);

    // 2. Fetch Predictions for Key Systems
    const systemsOfInterest = [
        'Vortex Multi-Canal (2 canais)',
        'Anti-Vortex Multi-Canal (2 canais)',
        'PyramidPascal',
        'Anti-Vortex Pyramid',
        'Random Generator',
        'Hot Numbers'
    ];

    const preds = await prisma.systemPrediction.findMany({
        where: {
            drawId: targetDrawId,
            systemName: { in: systemsOfInterest }
        }
    });

    const predsMap = new Map<string, number[]>();
    preds.forEach(p => {
        // Handle "[1, 2, 3]" or "1,2,3" format
        const cleanStr = p.prediction.replace(/[\[\]]/g, '');
        if (!cleanStr.trim()) return;

        const nums = cleanStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        predsMap.set(p.systemName, nums);
    });

    // 3. Debug Output
    console.log(`Methods Found: ${predsMap.size}/${systemsOfInterest.length}`);
    predsMap.forEach((nums, name) => {
        console.log(`[${name}] (${nums.length}): ${nums.join(', ')}`);
    });

    // 4. Quartet Analysis
    console.log(`\n💎 QUARTET ANALYSIS (The 215 JP Combination)`);
    const quartetMembers = ['PyramidPascal', 'Anti-Vortex Pyramid', 'Random Generator', 'Hot Numbers'];

    // Check if we have all 4
    const availableMembers = quartetMembers.filter(n => predsMap.has(n));
    if (availableMembers.length < 4) {
        console.log(`⚠️ Warning: Only found ${availableMembers.length}/4 systems. Consensus might be weaker.`);
        console.log(`Missing: ${quartetMembers.filter(n => !predsMap.has(n)).join(', ')}`);
    }

    const numberCounts = new Map<number, number>();
    availableMembers.forEach(sys => {
        const nums = predsMap.get(sys) || [];
        nums.forEach(n => {
            numberCounts.set(n, (numberCounts.get(n) || 0) + 1);
        });
    });

    // Calculate Consensus
    const allNumbers = Array.from(numberCounts.keys()).sort((a, b) => a - b);
    const consensus4 = Array.from(numberCounts.entries()).filter(([n, c]) => c >= 4).map(([n]) => n).sort((a, b) => a - b);
    const consensus3 = Array.from(numberCounts.entries()).filter(([n, c]) => c >= 3).map(([n]) => n).sort((a, b) => a - b);
    const consensus2 = Array.from(numberCounts.entries()).filter(([n, c]) => c >= 2).map(([n]) => n).sort((a, b) => a - b);

    console.log(`\n🎲 Numbers on the Table (Union): ${allNumbers.length}`);
    console.log(`\n🏆 STRONG CONSENSUS (3+ Systems Agree):`);
    if (consensus3.length > 0) console.log(consensus3.join(', '));
    else console.log("None.");

    console.log(`\n⚖️ MODERATE CONSENSUS (2+ Systems Agree):`);
    if (consensus2.length > 0) console.log(consensus2.join(', '));
    else console.log("None.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
