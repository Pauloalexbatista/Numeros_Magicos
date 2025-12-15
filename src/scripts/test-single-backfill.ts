
import { backfillService } from '../services/backfill-service';
import { prisma } from '../lib/prisma';
import { rankedSystems } from '../services/ranked-systems';

async function testSingleSystemBackfill() {
    console.log('🧪 TESTING Single System Backfill Locally...');

    const systemName = rankedSystems[0].name; // Pick the first system
    const fakeSystemName = "SystemThatDoes not Exist";

    console.log(`🎯 Target System: ${systemName}`);

    // 1. Test processing valid system
    console.log('Test 1: Valid System');
    const result1 = await backfillService.processBatch(1892, 10, systemName);
    console.log('Result 1:', result1);

    // Verify DB only has entries for this system in this range? 
    // Ideally we'd clean up first to be sure, but we can check the count.

    // 2. Test processing invalid system
    console.log('\nTest 2: Invalid System');
    const result2 = await backfillService.processBatch(1892, 10, fakeSystemName);
    console.log('Result 2:', result2);

    if (result2.savedPerformances === 0) {
        console.log('✅ PASS: Invalid system processed 0 records.');
    } else {
        console.error('❌ FAIL: Invalid system processed records.');
        process.exit(1);
    }

    console.log('\n✅ Single System Test Passed');
}

testSingleSystemBackfill()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
