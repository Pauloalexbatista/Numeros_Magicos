
import { prisma } from '../lib/prisma';
import { evaluateDrawStars } from '../services/ranking';

async function debugStars() {
    console.log('⭐ Debugging Totoloto Stars...');

    // 1. Check raw data format
    const draw = await prisma.draw.findFirst({
        where: { game: 'TOTOLOTO' },
        orderBy: { date: 'desc' }
    });

    if (!draw) {
        console.log('No Totoloto draws found.');
        return;
    }

    console.log(`Draw ${draw.id} (${draw.date.toISOString()}):`);
    console.log(` - Numbers: ${draw.numbers} (Type: ${typeof draw.numbers})`);
    console.log(` - Stars: ${draw.stars} (Type: ${typeof draw.stars})`);

    try {
        const parsed = JSON.parse(draw.stars);
        console.log(` - Parsed Stars:`, parsed);
        console.log(` - Is Array? ${Array.isArray(parsed)}`);
    } catch (e) {
        console.error(` - JSON Parse Error:`, e);
    }

    // 2. Try running evaluateDrawStars for just this one draw
    console.log('Test running evaluateDrawStars...');
    try {
        await evaluateDrawStars(draw.id);
        console.log('evaluateDrawStars completed without throwing.');
    } catch (e) {
        console.error('evaluateDrawStars threw:', e);
    }

    // 3. Check if any performance was created
    const count = await prisma.starSystemPerformance.count({
        where: { drawId: draw.id }
    });
    console.log(`Star Performance Count for Draw ${draw.id}: ${count}`);
}

debugStars()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
