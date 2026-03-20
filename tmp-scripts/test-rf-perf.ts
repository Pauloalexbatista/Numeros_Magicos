import { PrismaClient } from '@prisma/client';
import { buildFeaturesMatrix } from './src/services/neural/feature-extractor';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching EuroMillions draws...');
    const draws = await prisma.draw.findMany({
        where: { game: 'EUROMILLIONS' },
        orderBy: { id: 'asc' }
    });

    console.log(`Loaded ${draws.length} draws. Extracting features...`);
    const startTime = Date.now();
    
    const extracted = buildFeaturesMatrix(draws, 50, 'numbers');
    
    const endTime = Date.now();
    console.log(`Extraction complete in ${endTime - startTime}ms`);
    console.log(`Generated ${extracted.features.length} feature rows.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
