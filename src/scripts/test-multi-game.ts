
import { TotolotoService } from '../services/games/totoloto';

async function main() {
    console.log('--- Multi-Game Architecture Test ---');

    const service = new TotolotoService();
    try {
        await service.runPredictions();
        console.log('✅ Totoloto Service ran successfully');
    } catch (error) {
        console.error('❌ Error running Totoloto Service:', error);
        process.exit(1);
    }
}

main().catch(console.error);
