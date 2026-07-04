import { prisma } from '../../lib/prisma';
import { FacebookService } from '../../services/facebookService';

async function run() {
    console.log('================================================');
    console.log('  NUMEROS MAGICOS - FACEBOOK PUBLISHER TOOL');
    console.log('================================================\n');

    const pageId = process.env.FACEBOOK_PAGE_ID;
    const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    if (!pageId || !token) {
        console.error('❌ ERROR: FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN is missing!');
        process.exit(1);
    }

    console.log('✅ Environment configured for Page ID: ' + pageId + '\n');

    const games = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO', 'MEGASENA'];

    for (const game of games) {
        console.log('------------------------------------------------');
        console.log('🔍 Checking latest draw for ' + game + '...');

        const draw = await prisma.draw.findFirst({
            where: { game },
            orderBy: { date: 'desc' }
        });

        if (!draw) {
            console.log('⚠️ No draw found in DB for ' + game + '.');
            continue;
        }

        const formattedDate = draw.date.toISOString().split('T')[0];
        console.log('📌 Found latest draw ID ' + draw.id + ' (' + formattedDate + '), Concurso: ' + (draw.sequenceNumber || 'N/A'));
        console.log('🚀 Publishing Draw Result (Type A)...');

        const drawSuccess = await FacebookService.publishDrawResult(draw.id);
        console.log('   Type A Result: ' + (drawSuccess ? 'SUCCESS ✅' : 'FAILED ❌'));

        console.log('🏆 Checking Jackpot Performances (Type B)...');
        const jackpotsPublished = await FacebookService.publishJackpotPerformances(draw.id);
        console.log('   Type B Result: ' + jackpotsPublished + ' jackpot post(s) published.');
    }

    console.log('\n================================================');
    console.log('  FACEBOOK PUBLICATION PROCESS COMPLETE');
    console.log('================================================\n');
}

run().catch((err) => {
    console.error('Fatal error in publish-facebook-draws:', err);
    process.exit(1);
});
