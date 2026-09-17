/**
 * O Destilador de Ouro (Sistema de 3ª Geração - Meta-Ensemble Dinâmico)
 * 
 * Génese: Paulo Alexandre Batista
 * 
 * Conceito & Lógica Operacional:
 * 1. Em vez de utilizar uma equipa estática pré-fixada, avalia concurso a concurso
 *    o estado de maturação (Radar JPI) dos 13 especialistas primários.
 * 2. Convoca unicamente a tripla de ouro (Top 3) que se encontra no ponto ideal
 *    de colheita ("Fruta Madura" / Sweet Spot) para gerar a previsão do próximo sorteio.
 * 3. Aplica a Regra Sagrada:
 *    - +1000 nos números do Top Half + Bónus por Quina (100, 75, 50, 30, 15)
 *    - -1000 nos números da 2ª metade (Anti-Sistema)
 * 4. Aplica Inversão Estratégica nos jogos com polarização reversa (Euromilhões e Totoloto).
 * 5. Regista a proveniência exata: a lista dos 3 especialistas convocados para cada concurso.
 */

export const PRIMARY_SPECIALIST_NAMES: Record<string, string> = {
  clustering: 'Agrupamento (Clustering)',
  diagonais_matriz_3d: 'Diagonais da Matriz 3D',
  diagonais_matriz: 'Diagonais da Matriz 2D',
  mais_quentes: 'Mais Quentes (Hot)',
  mais_sorteadas_sempre: 'Mais Sorteadas de Sempre',
  markov: 'Cadeia de Markov',
  media_3_otimizado: 'Média 3 Otimizado',
  monte_carlo: 'Simulação Monte Carlo',
  oscilacao_universal: 'Oscilação Universal',
  piramide_intervalos: 'Pirâmide de Intervalos',
  piramide_pascal: 'Pirâmide de Pascal',
  random_forest: 'Random Forest',
  ultimos_a_sair: 'Últimos a Sair'
};

export class DestiladorSweetSpot {
  name = "O Destilador de Ouro";
  description = "Meta-sistema de 3ª Geração que em cada concurso convoca unicamente a tripla de especialistas primários no Sweet Spot (Fruta Madura) do Radar JPI.";

  getQuinaPoints(rank: number, halfPoint: number): number {
    const quinaIdx = Math.floor(rank / 5);
    const maxQuina = halfPoint / 5;
    if (quinaIdx >= maxQuina) return 0;

    switch (quinaIdx) {
      case 0: return 100;
      case 1: return 75;
      case 2: return 50;
      case 3: return 30;
      case 4: return 15;
      case 5: return 8;
      default: return 0;
    }
  }

  combineSpecialists(
    specialistPredictions: number[][],
    maxNum: number,
    halfPoint: number,
    game: string
  ): number[] {
    if (!specialistPredictions || specialistPredictions.length === 0) {
      return Array.from({ length: maxNum }, (_, idx) => idx + 1);
    }

    const points = new Float32Array(maxNum + 1);
    const consensusCount = new Uint8Array(maxNum + 1);

    for (const predArr of specialistPredictions) {
      for (let rank = 0; rank < predArr.length; rank++) {
        const num = predArr[rank];
        if (num >= 1 && num <= maxNum) {
          if (rank < halfPoint) {
            points[num] += 1000 + this.getQuinaPoints(rank, halfPoint);
            consensusCount[num]++;
          } else {
            points[num] -= 1000;
          }
        }
      }
    }

    const scores: { num: number; pts: number; consensus: number }[] = [];
    for (let num = 1; num <= maxNum; num++) {
      scores.push({
        num,
        pts: points[num],
        consensus: consensusCount[num]
      });
    }

    // No Euromilhões e Totoloto a Inversão Estratégica gera os picos de jackpots nas pontas
    const isInverted = game === 'EUROMILLIONS' || game === 'TOTOLOTO';

    scores.sort((a, b) => {
      const diff = isInverted ? a.pts - b.pts : b.pts - a.pts;
      if (Math.abs(diff) > 0.0001) return diff;
      const cDiff = isInverted ? a.consensus - b.consensus : b.consensus - a.consensus;
      if (cDiff !== 0) return cDiff;
      return a.num - b.num;
    });

    return scores.map(s => s.num);
  }
}
