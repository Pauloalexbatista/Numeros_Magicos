
import { PrismaClient } from '@prisma/client';
import { getSystemStatsForRange } from '../app/ranking/actions';

async function verifyFix() {
    console.log("🔍 Verificando correção das estatísticas do EuroDreams...");

    const systemName = 'Sistema Oscilação Universal V2 (EuroDreams)';
    const stats = await getSystemStatsForRange(systemName, 20, 'EURODREAMS');

    console.log(`Sistema: ${systemName}`);
    console.log(`Total Analisado: ${stats.total}`);
    console.log(`Distribuição: ${JSON.stringify(stats.distribution)}`);

    if (stats.distribution[6] === 1) {
        console.log("✅ SUCESSO: O acerto de 6 foi encontrado na distribuição dos últimos 20 sorteios!");
    } else {
        console.error("❌ FALHA: O acerto de 6 ainda não aparece na distribuição.");
    }
}

verifyFix().catch(console.error);
