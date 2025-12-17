import { PrismaClient } from '@prisma/client';

const PROD_URL = "postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

async function checkProdStatus() {
    console.log('🔍 Checking Production Database Status...\n');

    const prisma = new PrismaClient({
        datasources: { db: { url: PROD_URL } }
    });

    try {
        const draws = await prisma.draw.count();
        const performance = await prisma.systemPerformance.count();
        const predictions = await prisma.systemPrediction.count();
        const starPerf = await prisma.starSystemPerformance.count();
        const rankings = await prisma.systemRanking.count();

        console.log('📊 PRODUCTION DATABASE STATUS:');
        console.log(`   Draws: ${draws}`);
        console.log(`   System Performance: ${performance}`);
        console.log(`   System Predictions: ${predictions}`);
        console.log(`   Star Performance: ${starPerf}`);
        console.log(`   System Rankings: ${rankings}`);
        console.log('');

        if (draws === 0) {
            console.log('⚠️  WARNING: No draws in production!');
            console.log('   Site will show: "No data available"\n');
        }

        if (performance === 0 && rankings === 0) {
            console.log('⚠️  WARNING: No rankings/performance data!');
            console.log('   Site will show: Empty rankings\n');
        }

        console.log('✅ Check complete\n');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkProdStatus();
