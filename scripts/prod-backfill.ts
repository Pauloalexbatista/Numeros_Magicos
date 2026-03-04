import { backfillRankings } from '../src/services/ranking';

async function main() {
    const limit = 15;
    console.log(`🚀 Starting PRODUCTION BACKFILL (Last ${limit} draws)`);
    console.log(`Target: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]}`);

    try {
        await backfillRankings(limit);
        console.log('✅ Backfill successfully completed on Production Database.');
    } catch (error) {
        console.error('❌ Backfill failed:', error);
        process.exit(1);
    }
}

main();
