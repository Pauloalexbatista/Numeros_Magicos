import { EuroMillionsService } from '../../services/euroMillionsService';
import { EuroDreamsService } from '../../services/euroDreamsService';
import { TotolotoService } from '../../services/totolotoService';

async function main() {
    console.log('================================================');
    console.log('Starting historical data seeding for all games...');
    console.log('================================================');

    try {
        console.log('\n[1/3] Sincronizando Histórico EuroMilhões...');
        const emService = new EuroMillionsService();
        await emService.seedFromArchive(2004); 

        console.log('\n[2/3] Sincronizando Histórico EuroDreams...');
        const edService = new EuroDreamsService();
        await edService.seedFromArchive(2023); 

        console.log('\n[3/3] Sincronizando Histórico Totoloto...');
        const ttService = new TotolotoService();
        await ttService.seedFromArchive(2011); 

        console.log('\n================================================');
        console.log('✅ Seeding complete!');
        console.log('Por favor verifique a página do Administrador.');
    } catch (error) {
        console.error('Error during seeding:', error);
    }
}

main();
