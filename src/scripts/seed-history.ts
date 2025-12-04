import { EuroMillionsService } from '../services/euroMillionsService';

async function main() {
    console.log('Starting historical data seeding...');
    const service = new EuroMillionsService();
    await service.seedFromArchive();
    console.log('Seeding complete!');
}

main();
