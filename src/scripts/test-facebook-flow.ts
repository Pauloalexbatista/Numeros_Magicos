import { prisma } from '../lib/prisma';
import { FacebookService } from '../services/facebookService';

async function run() {
    console.log("=== FACEBOOK AUTOMATION TEST ===");
    
    // Find the latest Mega-Sena draw
    const draw = await prisma.draw.findFirst({
        where: { game: 'MEGASENA' },
        orderBy: { date: 'desc' }
    });

    if (!draw) {
        console.error("No Mega-Sena draw found in database.");
        return;
    }

    console.log(`Found latest draw: ID ${draw.id}, Date: ${draw.date.toISOString().split('T')[0]}, Concurso: ${draw.sequenceNumber}`);

    // Find a valid active RankedSystem for MEGASENA to avoid P2003 FK violation
    const activeSystem = await prisma.rankedSystem.findFirst({
        where: { game: 'MEGASENA', isActive: true }
    });

    if (!activeSystem) {
        console.error("No active system found for MEGASENA in RankedSystem table.");
        return;
    }

    const systemName = activeSystem.name;
    console.log(`Using active system for mock: "${systemName}"`);
    
    // Clean up any existing mock performance for this system/draw
    await prisma.systemPerformance.deleteMany({
        where: {
            drawId: draw.id,
            systemName: systemName
        }
    });

    // Create the mock performance
    const predictedNumbers = JSON.parse(draw.numbers); // predict exactly the winning numbers
    // Pad it to 30 numbers to make it realistic
    while (predictedNumbers.length < 30) {
        const r = Math.floor(Math.random() * 60) + 1;
        if (!predictedNumbers.includes(r)) {
            predictedNumbers.push(r);
        }
    }

    await prisma.systemPerformance.create({
        data: {
            drawId: draw.id,
            game: 'MEGASENA',
            systemName: systemName,
            predictedNumbers: JSON.stringify(predictedNumbers),
            actualNumbers: draw.numbers,
            hits: 6,
            accuracy: 100.0
        }
    });

    console.log(`Created mock perfect hits (6/6) for system "${systemName}" on Draw ID ${draw.id}.`);

    // Test 1: Publish Draw Result
    console.log("\nTesting Type A Post (Draw Results)...");
    const resultSuccess = await FacebookService.publishDrawResult(draw.id);
    console.log(`Result: ${resultSuccess ? 'SUCCESS' : 'FAILED'}`);

    // Test 2: Publish Jackpot Performances
    console.log("\nTesting Type B Post (Jackpot Performance)...");
    const jackpotCount = await FacebookService.publishJackpotPerformances(draw.id);
    console.log(`Result: Published ${jackpotCount} jackpot post(s).`);

    // Clean up mock performance
    await prisma.systemPerformance.deleteMany({
        where: {
            drawId: draw.id,
            systemName: systemName
        }
    });
    console.log("\nCleaned up mock database entries.");
}

run().catch(console.error);
