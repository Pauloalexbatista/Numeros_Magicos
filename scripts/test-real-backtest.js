const fs = require('fs');
const path = require('path');

// Metadados dos sistemas e perfis de evidência
const DNA_PROFILES = {
  // Totoloto:
  'totoloto:piramide_pascal': {
    actionPost5: 'DIRECT',
    actionPost0: 'DIRECT',
    p5_reason: 'Inércia comprovada: 6.8% repete 5 em T+1 (2.4x) e 45.5% tem >=4 em W3',
    p0_reason: 'Rebote de elite: 56.4% dispara 4 ou 5 em W3 (#1 do Totoloto)'
  },
  'totoloto:separacao_aguas_v2': {
    actionPost5: 'DIRECT',
    actionPost0: 'DIRECT',
    p5_reason: 'Inércia imediata T+1: 35.0% repete 4 ou 5 em T+1; 50.0% >=4 em W3',
    p0_reason: 'Rebote Pós-Zero: 40.7% bate 4 ou 5 em W3'
  },
  'totoloto:supersistema_neuronal': {
    actionPost5: 'DIRECT',
    actionPost0: 'DIRECT',
    p5_reason: 'Inércia potente: 62.5% repete >=4 no bloco direto em W3',
    p0_reason: 'Rebote: 40.5% bate 4 ou 5 em W3'
  },
  'totoloto:mais_quentes': {
    actionPost5: 'DIRECT',
    actionPost0: 'DIRECT',
    p5_reason: 'Alta repetição: 14.6% volta a dar 5 em W3',
    p0_reason: 'Rebote: 40.5% bate 4 ou 5 em W3'
  },
  'totoloto:diagonais_matriz': {
    actionPost5: 'DIRECT',
    actionPost0: 'DIRECT',
    p5_reason: 'Inércia: 7.5% repete 5 em T+1; 47.2% bate >=4 em W3',
    p0_reason: 'Rebote: 48.6% bate 4 ou 5 em W3'
  },
  'totoloto:clustering': {
    actionPost5: 'DIRECT',
    actionPost0: 'DIRECT',
    p5_reason: 'Inércia: 54.0% bate >=4 em W3',
    p0_reason: 'Rebote: 48.0% bate 4 ou 5 em W3'
  },
  // Euromilhões:
  'euromillions:separacao_aguas_v2': {
    actionPost5: 'MIRROR',
    actionPost0: 'DIRECT',
    p5_reason: 'Pêndulo violento: 53.3% bate 0 ou 1 (Anti-Sistema potente em W3)',
    p0_reason: 'Rebote Pós-Zero: 46.5% bate 4 ou 5 em W3'
  },
  'euromillions:supersistema_neuronal': {
    actionPost5: 'MIRROR',
    actionPost0: 'DIRECT',
    p5_reason: 'Pêndulo: 54.2% bate 0 ou 1 em W3 (jogar Anti-Sistema)',
    p0_reason: 'Rebote de elite: 62.0% bate 4 ou 5 em W3 (#1 do Euromilhões)'
  },
  'euromillions:piramide_pascal': {
    actionPost5: 'MIRROR',
    actionPost0: 'DIRECT',
    p5_reason: 'Pêndulo: 53.1% bate 0 ou 1 em W3 (jogar Anti-Sistema)',
    p0_reason: 'Rebote: 43.4% bate 4 ou 5 em W3'
  },
  'euromillions:mais_sorteadas_sempre': {
    actionPost5: 'DIRECT',
    actionPost0: 'DIRECT',
    p5_reason: 'Inércia contínua: Bloco Direto concentra >=4 em 57.7% em W3',
    p0_reason: 'Rebote: 38.9% bate 4 ou 5 em W3'
  }
};

function analyzeGameRecent(game, yearFilter = '2026') {
  const dir = path.join(process.cwd(), 'data', 'consolidated');
  const files = fs.readdirSync(dir).filter(f => f.endsWith(`_${game}.json`) && !f.includes('stars'));
  
  const strategies = [];

  for (const f of files) {
    const sysSlug = f.replace(`_${game}.json`, '');
    const profileKey = `${game}:${sysSlug}`;
    const profile = DNA_PROFILES[profileKey];
    if (!profile) continue; // focar nos sistemas chave auditados

    const raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    raw.sort((a,b) => new Date(a.date || a.draw?.date).getTime() - new Date(b.date || b.draw?.date).getTime());

    for (let i = 0; i < raw.length; i++) {
      const cur = raw[i];
      const curDate = cur.date || cur.draw?.date;
      if (!curDate || !curDate.startsWith(yearFilter)) continue;

      const hits = cur.num_hits_25 !== undefined ? cur.num_hits_25 : cur.hits?.num_hits_25;
      if (hits !== 5 && hits !== 0) continue;

      // Temos um gatilho real em 2026!
      const triggerType = hits === 5 ? 'JACKPOT_5' : 'ANTI_JACKPOT_0';
      const targetSide = hits === 5 ? profile.actionPost5 : profile.actionPost0;
      const thesis = hits === 5 ? profile.p5_reason : profile.p0_reason;

      // Avaliar os 3 sorteios seguintes
      const windowDraws = [];
      let success = false;
      let highestHit = 0;
      let winningDraw = null;

      for (let step = 1; step <= 3; step++) {
        const nextDraw = raw[i + step];
        if (!nextDraw) {
          windowDraws.push({ step, status: 'PENDING' });
          continue;
        }

        const nextDate = nextDraw.date || nextDraw.draw?.date;
        const nextDrawId = nextDraw.drawId;
        const nextDirectHits = nextDraw.num_hits_25 !== undefined ? nextDraw.num_hits_25 : nextDraw.hits?.num_hits_25;
        // Se apostamos no Anti-Sistema (MIRROR), o nosso acerto é 5 - nextDirectHits
        const actualApostaHits = targetSide === 'DIRECT' ? nextDirectHits : (5 - nextDirectHits);

        if (actualApostaHits > highestHit) highestHit = actualApostaHits;

        const isHit4or5 = actualApostaHits >= 4;
        if (isHit4or5 && !success) {
          success = true;
          winningDraw = { step, drawId: nextDrawId, date: nextDate, hits: actualApostaHits };
        }

        windowDraws.push({
          step: `T+${step}`,
          drawId: nextDrawId,
          date: nextDate ? nextDate.split('T')[0] : 'N/A',
          directHits: nextDirectHits,
          apostaHits: actualApostaHits,
          isWinner: isHit4or5
        });
      }

      const isCompleted = windowDraws.length === 3 && windowDraws.every(w => w.status !== 'PENDING');
      const status = isCompleted ? (success ? 'CONCRETIZADA' : 'EXPIRADA_SEM_PREMIO') : 'ATIVA';

      strategies.push({
        id: `${game}_${sysSlug}_${cur.drawId}`,
        game: game.toUpperCase(),
        system: sysSlug,
        triggerDate: curDate.split('T')[0],
        triggerDrawId: cur.drawId,
        triggerEvent: triggerType === 'JACKPOT_5' ? 'Saiu 5 (Jackpot)' : 'Saiu 0 (Anti-Jackpot)',
        targetSide, // 'DIRECT' ou 'MIRROR'
        thesis,
        windowDraws,
        highestHit,
        success,
        winningDraw,
        status
      });
    }
  }

  strategies.sort((a, b) => new Date(b.triggerDate).getTime() - new Date(a.triggerDate).getTime());
  return strategies;
}

const totolotoStrats = analyzeGameRecent('totoloto', '2026');
const euroStrats = analyzeGameRecent('euromillions', '2026');

console.log('=== TOTOLOTO 2026 BACKTEST ===');
console.log(`Total Gatilhos 5 e 0 em 2026: ${totolotoStrats.length}`);
const tCompleted = totolotoStrats.filter(s => s.status !== 'ATIVA');
const tWon = totolotoStrats.filter(s => s.success);
console.log(`Concluídas: ${tCompleted.length} | Concretizadas: ${tWon.length} (${tCompleted.length > 0 ? (tWon.length/tCompleted.length*100).toFixed(1) : 0}%)`);
console.log('\nÚltimas 5 estratégias do Totoloto em 2026:');
totolotoStrats.slice(0, 5).forEach(s => {
  console.log(`- [${s.triggerDate}] ${s.system} -> ${s.triggerEvent} | Aposta: ${s.targetSide} | Max Acertos: ${s.highestHit} | Estado: ${s.status}`);
  s.windowDraws.forEach(w => {
    console.log(`   ${w.step} (${w.date}): Direct=${w.directHits} -> ApostaHits=${w.apostaHits} ${w.isWinner ? '🎯 BATEU!' : ''}`);
  });
});

console.log('\n=== EUROMILHÕES 2026 BACKTEST ===');
console.log(`Total Gatilhos 5 e 0 em 2026: ${euroStrats.length}`);
const eCompleted = euroStrats.filter(s => s.status !== 'ATIVA');
const eWon = euroStrats.filter(s => s.success);
console.log(`Concluídas: ${eCompleted.length} | Concretizadas: ${eWon.length} (${eCompleted.length > 0 ? (eWon.length/eCompleted.length*100).toFixed(1) : 0}%)`);
console.log('\nÚltimas 5 estratégias do Euromilhões em 2026:');
euroStrats.slice(0, 5).forEach(s => {
  console.log(`- [${s.triggerDate}] ${s.system} -> ${s.triggerEvent} | Aposta: ${s.targetSide} | Max Acertos: ${s.highestHit} | Estado: ${s.status}`);
  s.windowDraws.forEach(w => {
    console.log(`   ${w.step} (${w.date}): Direct=${w.directHits} -> ApostaHits=${w.apostaHits} ${w.isWinner ? '🎯 BATEU!' : ''}`);
  });
});
