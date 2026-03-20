import { trainRandomForestModel } from './src/services/neural/rf-train-core';
import { PrismaClient } from '@prisma/client';
import { buildFeaturesMatrix } from './src/services/neural/feature-extractor';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing RF Extractor directly to catch the error...');
    
    const draws = await prisma.draw.findMany({
        where: { game: 'EUROMILLIONS' },
        orderBy: { id: 'asc' }
    });
    
    const extracted = buildFeaturesMatrix(draws, 50, 'numbers');
    console.log('Extracted Features length:', extracted.features.length);
    if(extracted.features.length > 0) {
        console.log('First feature row:', extracted.features[0]);
    }
    
    try {
        const result = await trainRandomForestModel('EUROMILLIONS', false, 50, 'RF_EUROMILLIONS_NUMBERS');
        console.log('Result:', result);
    } catch (e: any) {
        console.error('Fatal Error Caught:');
        console.error(e.message);
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
