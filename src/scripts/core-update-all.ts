import { EuroMillionsService } from '../services/euroMillionsService';
import { EuroDreamsService } from '../services/euroDreamsService';
import { TotolotoService } from '../services/totolotoService';
import { MegaSenaService } from '../services/megaSenaService';

async function updateAllGames() {
    console.log('='.repeat(60));
    console.log('GLOBAL MULTI-GAME UPDATE');
    console.log('='.repeat(60));
    console.log(`🕐 Started at: ${new Date().toLocaleString('pt-PT')}`);

    try {
        // 1. EuroMilhões
        console.log('\n💎 [EUROMILLIONS]');
        const emService = new EuroMillionsService();
        await emService.updateDatabase();

        // 2. EuroDreams
        console.log('\n🌙 [EURODREAMS]');
        const edService = new EuroDreamsService();
        await edService.updateDatabase();

        // 3. Totoloto
        console.log('\n🎲 [TOTOLOTO]');
        const ttService = new TotolotoService();
        await ttService.updateDatabase();

        // 4. Mega-Sena
        console.log('\n🎲 [MEGASENA]');
        const msService = new MegaSenaService();
        await msService.updateDatabase();

        console.log('\n' + '='.repeat(60));
        console.log('✅ Global Update Complete!');
        console.log('ℹ️  Motores neuronais em reconstrução. Treino automático desativado.');
        console.log('='.repeat(60));
    } catch (error) {
        console.error('\n❌ Global Update Failed:', error);
        process.exit(1);
    }
}

updateAllGames();
