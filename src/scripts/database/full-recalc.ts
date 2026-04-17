
import { backfillRankings } from '../../services/ranking';
import { prisma } from '../../lib/prisma';

async function fullRecalc() {
    console.log('🚀 Starting Full Performance Recalculation...');
    
    // We want to process enough history to have stable rankings.
    // 2000 draws covers EuroMillions fully (started in 2004, twice a week = ~2000 draws).
    const LIMIT = 2500; 

    try {
        console.log('\n💎 processing EUROMILLIONS...');
        await backfillRankings(LIMIT);
        
        console.log('\n🎲 processing TOTOLOTO...');
        // backfillRankings processes all games by default in its current implementation
        // but it sorts by date globally. This is fine.
        
        console.log('\n✅ Full Recalculation Complete!');
    } catch (error) {
        console.error('❌ Error during recalculation:', error);
    }
}

fullRecalc().catch(console.error).finally(() => prisma.$disconnect());
