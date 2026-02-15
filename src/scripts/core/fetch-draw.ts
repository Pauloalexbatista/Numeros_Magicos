import { EuroMillionsService } from '../../services/euroMillionsService';
import { TotolotoService } from '../../services/totolotoService';
import { EuroDreamsService } from '../../services/euroDreamsService';
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('🌍 checks for updates on ALL games...');

    // 1. EUROMILLIONS
    console.log('\n🔵 Checking EuroMillions...');
    const euromillions = new EuroMillionsService();
    const addedEuro = await euromillions.updateDatabase();
    if (addedEuro) console.log('✨ New EUROMILLIONS draw found!');
    else console.log('💤 No new EUROMILLIONS draw.');

    // 2. TOTOLOTO
    console.log('\n🔴 Checking Totoloto...');
    const totoloto = new TotolotoService();
    const addedTotoloto = await totoloto.updateDatabase();
    if (addedTotoloto) console.log('✨ New TOTOLOTO draw found!');
    else console.log('💤 No new TOTOLOTO draw.');

    // 3. EURODREAMS
    console.log('\n🟣 Checking EuroDreams...');
    const eurodreams = new EuroDreamsService();
    const addedDreams = await eurodreams.updateDatabase();
    if (addedDreams) console.log('✨ New EURODREAMS draw found!');
    else console.log('💤 No new EURODREAMS draw.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
