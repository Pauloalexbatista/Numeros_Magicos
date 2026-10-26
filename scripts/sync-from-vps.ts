import dotenv from 'dotenv';
dotenv.config();
import { syncFromVPS } from '../src/services/vps-sync-service';

async function main() {
  console.log('🔄 ==========================================');
  console.log('🚀 SINCRONIZADOR LOCAL DA BASE DE DADOS VPS');
  console.log('🔄 ==========================================\n');

  const days = process.argv[2] ? parseInt(process.argv[2], 10) : 90;
  console.log(`📡 A ligar à VPS (últimos ${days} dias)...`);

  const result = await syncFromVPS(days);

  if (result.success) {
    console.log(`\n✅ ${result.message}`);
    console.log(`   🎲 Novos sorteios importados: ${result.drawsSynced}`);
    console.log(`   🔮 Previsões calculadas sincronizadas: ${result.predictionsSynced}`);
    console.log(`   ⭐ Previsões do próximo sorteio (cache): ${result.cachedPredictionsSynced}`);
    console.log(`   ⏱️ Tempo total: ${(result.durationMs / 1000).toFixed(2)}s\n`);
    process.exit(0);
  } else {
    console.error(`\n❌ Falha na sincronização: ${result.message}`);
    if (result.error) console.error(`   Detalhe: ${result.error}`);
    process.exit(1);
  }
}

main();
