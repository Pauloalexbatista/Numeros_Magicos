
import { cachePredictions } from '../services/ranking';

async function run() {
    console.log('🚀 Iniciando recálculo total de cache (Previsões N+1)...');
    try {
        await cachePredictions();
        console.log('\n✅ Cache atualizado com sucesso!');
    } catch (error) {
        console.error('\n❌ Erro ao atualizar cache:', error);
    }
}

run();
