import { getTopSystemsYearlyAnalysis, invalidateRankingCache } from '../src/app/ranking/actions';

async function testRanking() {
  await invalidateRankingCache('TOTOLOTO');
  const data = await getTopSystemsYearlyAnalysis('TOTOLOTO');
  console.log('Anos disponíveis:', Object.keys(data));
  const stats2026 = data['2026'] || [];
  console.log(`\n=== RANKING TOTOLOTO 2026 (${stats2026.length} sistemas) ===`);
  stats2026.forEach((s, idx) => {
    const isNew = s.systemName.includes('Harmonia') || s.systemName.includes('2.0');
    const badge = isNew ? ' ⭐ NOVO SISTEMA!' : '';
    console.log(`#${idx + 1}: ${s.systemName} — Jackpots: ${s.jackpots}, Traves: ${s.highPrizes}${badge}`);
  });
}

testRanking().then(() => process.exit(0));
