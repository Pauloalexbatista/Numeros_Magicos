import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

// Sistemas do Euromilhoes com Taxa de Separacao > 5% (> 100 jackpots combinados):
// 1. Diagonais da Matriz (110)
// 2. Diagonais da Matriz 3D (108)
// 3. Mais Sorteadas de Sempre (106)
// 4. Últimos a Sair (104)
// 5. Pirâmide de Pascal (102)
// 6. Sistema Média +3 Otimizado (102)

async function testPolaritySpecialists() {
  const game = 'EUROMILLIONS';
  const maxVal = 50;
  const half = 25;

  const draws = await p.draw.findMany({ where: { game }, orderBy: { date: 'asc' } });

  // Testar 3 combinacoes de especialistas com taxa > 5%:
  const combos = [
    {
      name: 'Super-Polaridade Top 5 [Diagonais 2D, Diagonais 3D, Mais Sorteadas, Últimos a Sair, Pascal]',
      specs: [
        'Diagonais da Matriz',
        'Diagonais da Matriz 3D',
        'Mais Sorteadas de Sempre',
        'Últimos a Sair',
        'Pirâmide de Pascal'
      ]
    },
    {
      name: 'Super-Polaridade Top 5 com Média+3 [Diagonais 2D, Diagonais 3D, Mais Sorteadas, Últimos a Sair, Média +3]',
      specs: [
        'Diagonais da Matriz',
        'Diagonais da Matriz 3D',
        'Mais Sorteadas de Sempre',
        'Últimos a Sair',
        'Sistema Média +3 Otimizado'
      ]
    },
    {
      name: 'Super-Polaridade Todos os 6 com >5% [Diagonais 2D, 3D, Sorteadas, Últimos, Pascal, Média +3]',
      specs: [
        'Diagonais da Matriz',
        'Diagonais da Matriz 3D',
        'Mais Sorteadas de Sempre',
        'Últimos a Sair',
        'Pirâmide de Pascal',
        'Sistema Média +3 Otimizado'
      ]
    }
  ];

  // Carregar previsoes de todos os candidatos
  const allCandidateNames = Array.from(new Set(combos.flatMap(c => c.specs)));
  const allPreds = await p.systemPrediction.findMany({
    where: { game, domain: 'NUMBERS', systemName: { in: allCandidateNames } },
    select: { drawId: true, systemName: true, prediction: true }
  });

  const drawMap = new Map();
  for (const ep of allPreds) {
    if (!drawMap.has(ep.drawId)) drawMap.set(ep.drawId, new Map());
    try { drawMap.get(ep.drawId).set(ep.systemName, JSON.parse(ep.prediction)); } catch(e) {}
  }

  // Funcao canonica dos Quintetos de Ouro com Muralha
  function getQuinaPoints(rank) {
    const b = Math.floor(rank / 5);
    if (b === 0) return 100;
    if (b === 1) return 75;
    if (b === 2) return 50;
    if (b === 3) return 30;
    if (b === 4) return 15;
    return 0; // Muralha
  }

  for (const combo of combos) {
    let directJackpots = 0;
    let antiJackpots = 0;
    let hits4Direct = 0;
    let hits4Anti = 0;

    for (const d of draws) {
      const expertMap = drawMap.get(d.id);
      if (!expertMap) continue;

      const availablePreds = [];
      for (const sName of combo.specs) {
        if (expertMap.has(sName)) availablePreds.push(expertMap.get(sName));
      }
      if (availablePreds.length < 2) continue;

      const points = new Float32Array(maxVal + 1);
      for (const predArr of availablePreds) {
        for (let rank = 0; rank < predArr.length; rank++) {
          const num = predArr[rank];
          if (num <= maxVal) {
            points[num] += getQuinaPoints(rank);
          }
        }
      }

      const scored = [];
      for (let n = 1; n <= maxVal; n++) scored.push({ num: n, pts: points[n] });
      scored.sort((a, b) => b.pts - a.pts || a.num - b.num);

      const finalTop = scored.slice(0, half).map(s => s.num);
      const actualNums = JSON.parse(d.numbers);
      const match = finalTop.filter(n => actualNums.includes(n)).length;

      if (match === 5) directJackpots++;
      if (match === 0) antiJackpots++; // 5 no anti-sistema
      if (match === 4) hits4Direct++;
      if (match === 1) hits4Anti++;   // 4 no anti-sistema
    }

    const totalJackpots = directJackpots + antiJackpots;
    const taxa = ((totalJackpots / draws.length) * 100).toFixed(2) + '%';
    console.log(`\n--------------------------------------------------------------`);
    console.log(`Combinação: ${combo.name}`);
    console.log(`Jackpots DIRETO: ${directJackpots} | Jackpots ANTI-SISTEMA: ${antiJackpots} | TOTAL JACKPOTS COMBINADOS: ${totalJackpots} (${taxa})`);
    console.log(`4 Acertos DIRETO: ${hits4Direct} | 4 Acertos ANTI-SISTEMA: ${hits4Anti}`);
  }
}

testPolaritySpecialists().finally(() => p.$disconnect());
