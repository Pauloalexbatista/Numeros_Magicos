import { EuroMillionsService } from '../services/euroMillionsService';
import { EuroDreamsService } from '../services/euroDreamsService';
import { TotolotoService } from '../services/totolotoService';

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

        console.log('\n' + '='.repeat(60));
        console.log('✅ Global Update Complete!');
        
        // 4. Automatic Neural Update (Random Forest Only - Safe & Fast)
        console.log('\n🧠 [NEURAL AUTO-TRAIN] Iniciando atualização de modelos Random Forest...');
        const { trainRandomForestModel } = await import('../services/neural/rf-train-core');
        
        const configs = [
            { game: 'EUROMILLIONS', isStars: false, maxVal: 50, type: 'RF_EUROMILLIONS_NUMBERS' },
            { game: 'EUROMILLIONS', isStars: true, maxVal: 12, type: 'RF_EUROMILLIONS_STARS' },
            { game: 'TOTOLOTO', isStars: false, maxVal: 49, type: 'RF_TOTOLOTO_NUMBERS' },
            { game: 'TOTOLOTO', isStars: true, maxVal: 13, type: 'RF_TOTOLOTO_STARS' },
            { game: 'EURODREAMS', isStars: false, maxVal: 40, type: 'RF_EURODREAMS_NUMBERS' },
            { game: 'EURODREAMS', isStars: true, maxVal: 5, type: 'RF_EURODREAMS_STARS' },
        ];

        for (const config of configs) {
            process.stdout.write(`   ⚙️  Treinando ${config.type}... `);
            const res = await trainRandomForestModel(config.game, config.isStars, config.maxVal, config.type);
            console.log(res.success ? `✅ (${res.accuracy}%)` : `❌ (${res.message})`);
        }

        console.log('='.repeat(60));
    } catch (error) {
        console.error('\n❌ Global Update Failed:', error);
        process.exit(1);
    }
}

updateAllGames();
