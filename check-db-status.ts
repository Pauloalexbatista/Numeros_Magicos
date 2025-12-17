import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseStatus() {
    console.log('='.repeat(80));
    console.log('📊 DATABASE STATUS CHECK');
    console.log('='.repeat(80));
    console.log('');

    try {
        // Count totals
        const drawCount = await prisma.draw.count();
        const predictionCount = await prisma.systemPrediction.count();
        const performanceCount = await prisma.systemPerformance.count();
        const starPerformanceCount = await prisma.starSystemPerformance.count();

        console.log('📈 TOTALS:');
        console.log(`   Draws: ${drawCount}`);
        console.log(`   System Predictions: ${predictionCount}`);
        console.log(`   System Performance: ${performanceCount}`);
        console.log(`   Star Performance: ${starPerformanceCount}`);
        console.log('');

        // Get latest draw
        const latestDraw = await prisma.draw.findFirst({
            orderBy: { date: 'desc' },
            select: { id: true, date: true, numbers: true, stars: true }
        });

        if (latestDraw) {
            console.log('🎯 LATEST DRAW:');
            console.log(`   ID: ${latestDraw.id}`);
            console.log(`   Date: ${new Date(latestDraw.date).toLocaleDateString('pt-PT')}`);
            console.log(`   Numbers: ${latestDraw.numbers}`);
            console.log(`   Stars: ${latestDraw.stars}`);
            console.log('');

            // Check predictions for latest draw
            const latestPredictions = await prisma.systemPrediction.count({
                where: { drawId: latestDraw.id }
            });

            const latestPerformance = await prisma.systemPerformance.count({
                where: { drawId: latestDraw.id }
            });

            console.log('🔍 LATEST DRAW DATA:');
            console.log(`   Predictions: ${latestPredictions}`);
            console.log(`   Performance Records: ${latestPerformance}`);
            console.log('');
        }

        // Check for duplicates
        const duplicateDraws = await prisma.$queryRaw<Array<{ date: Date; count: number }>>`
            SELECT date, COUNT(*) as count
            FROM Draw
            GROUP BY date
            HAVING COUNT(*) > 1
        `;

        if (duplicateDraws.length > 0) {
            console.log('⚠️  DUPLICATE DRAWS FOUND:');
            duplicateDraws.forEach(d => {
                console.log(`   ${new Date(d.date).toLocaleDateString('pt-PT')}: ${d.count} entries`);
            });
            console.log('');
        } else {
            console.log('✅ No duplicate draws found');
            console.log('');
        }

        // Check for duplicate predictions
        const duplicatePredictions = await prisma.$queryRaw<Array<{ drawId: number; systemName: string; count: number }>>`
            SELECT drawId, systemName, COUNT(*) as count
            FROM SystemPrediction
            GROUP BY drawId, systemName
            HAVING COUNT(*) > 1
        `;

        if (duplicatePredictions.length > 0) {
            console.log('⚠️  DUPLICATE PREDICTIONS FOUND:');
            duplicatePredictions.forEach(d => {
                console.log(`   Draw ${d.drawId} - ${d.systemName}: ${d.count} entries`);
            });
            console.log('');
        } else {
            console.log('✅ No duplicate predictions found');
            console.log('');
        }

        // Check for duplicate performance
        const duplicatePerformance = await prisma.$queryRaw<Array<{ drawId: number; systemName: string; count: number }>>`
            SELECT drawId, systemName, COUNT(*) as count
            FROM system_performance
            GROUP BY drawId, systemName
            HAVING COUNT(*) > 1
        `;

        if (duplicatePerformance.length > 0) {
            console.log('⚠️  DUPLICATE PERFORMANCE RECORDS FOUND:');
            duplicatePerformance.forEach(d => {
                console.log(`   Draw ${d.drawId} - ${d.systemName}: ${d.count} entries`);
            });
            console.log('');
        } else {
            console.log('✅ No duplicate performance records found');
            console.log('');
        }

        console.log('='.repeat(80));
        console.log('✅ CHECK COMPLETE');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ Error checking database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabaseStatus();
