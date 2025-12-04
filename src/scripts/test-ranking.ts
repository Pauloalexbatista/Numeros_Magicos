import { PrismaClient } from '@prisma/client';
import { onNewDrawAdded } from '../services/ranking-evaluator';

const prisma = new PrismaClient();

async function testRankingSystem() {
    console.log('🧪 Testing Ranking System...\n');

    try {
        // 1. Get latest draw
        console.log('1️⃣ Fetching latest draw...');
        const latestDraw = await prisma.draw.findFirst({
            orderBy: { date: 'desc' }
        });

        if (!latestDraw) {
            console.error('❌ No draws found in database!');
            return;
        }

        console.log(`✅ Latest draw: ${latestDraw.date.toISOString().split('T')[0]}`);
        console.log(`   Numbers: ${latestDraw.numbers}`);
        console.log('');

        // 2. Simulate evaluation
        console.log('2️⃣ Simulating system evaluation...');
        await onNewDrawAdded(latestDraw);
        console.log('');

        // 3. Check results
        console.log('3️⃣ Checking results...');
        const performances = await prisma.systemPerformance.findMany({
            where: { drawId: latestDraw.id },
            include: { system: true }
        });

        if (performances.length === 0) {
            console.log('⚠️ No performances recorded yet');
        } else {
            console.log(`✅ ${performances.length} systems evaluated:`);
            performances.forEach(p => {
                console.log(`   ${p.systemName}: ${p.hits}/5 hits (${p.accuracy.toFixed(1)}%)`);
                console.log(`      Predicted: ${p.predictedNumbers}`);
            });
        }
        console.log('');

        // 4. Check ranking
        console.log('4️⃣ Checking ranking...');
        const ranking = await prisma.systemRanking.findMany({
            include: { system: true },
            orderBy: { avgAccuracy: 'desc' }
        });

        if (ranking.length === 0) {
            console.log('⚠️ No ranking calculated yet');
        } else {
            console.log('✅ Current Ranking:');
            ranking.forEach((r, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                console.log(`   ${medal} ${r.systemName}: ${r.avgAccuracy.toFixed(2)}% (${r.totalPredictions} predictions)`);
            });
        }
        console.log('');

        console.log('✅ Test completed successfully!');
        console.log('\n📊 Next steps:');
        console.log('   1. Start dev server: npm run dev');
        console.log('   2. Visit: http://localhost:3000/ranking');
        console.log('   3. Check the ranking page!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testRankingSystem();
