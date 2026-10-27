import { invalidateRankingCache } from '../src/app/ranking/actions';

async function main() {
  await invalidateRankingCache();
  console.log('✅ Cache do Ranking completamente invalidado em todos os jogos!');
}

main().then(() => process.exit(0));
