import { TotolotoService } from '../services/totolotoService';
import { EuroDreamsService } from '../services/euroDreamsService';
import { EuroMillionsService } from '../services/euroMillionsService';
import { prisma } from '../lib/prisma';

async function manualUpdate() {
    console.log('🚀 Iniciando atualização manual de sorteios...');

    try {
        const tlService = new TotolotoService();
        const edService = new EuroDreamsService();
        const emService = new EuroMillionsService();

        console.log('\n--- Totoloto ---');
        await tlService.updateDatabase();

        console.log('\n--- EuroDreams ---');
        await edService.updateDatabase();

        console.log('\n--- EuroMillions ---');
        await emService.updateDatabase();

        console.log('\n✅ Atualização concluída!');
    } catch (error) {
        console.error('❌ Erro durante a atualização manual:', error);
    } finally {
        await prisma.$disconnect();
    }
}

manualUpdate();
