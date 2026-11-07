/**
 * Sistema Separação das Águas 2.0 (Ensemble com Inversão Cirúrgica de Polaridade)
 * 
 * Lógica Canónica:
 * Ensemble Borda com 5 especialistas calibrados:
 * 1. Agrupamento de Padrões (Clustering) -> ESPELHO (Inversão de Polaridade)
 * 2. Últimos a Sair -> DIRETO
 * 3. Mais Quentes -> DIRETO
 * 4. Pirâmide de Pascal -> ESPELHO (Inversão de Polaridade)
 * 5. Tiro Certeiro -> DIRETO
 */

export const SEPARACAO_AGUAS_V2_CONFIG = [
    { dbName: 'Agrupamento de Padrões (Clustering)', polarity: 'ESPELHO' as const },
    { dbName: 'Últimos a Sair', polarity: 'DIRETO' as const },
    { dbName: 'Mais Quentes', polarity: 'DIRETO' as const },
    { dbName: 'Pirâmide de Pascal', polarity: 'ESPELHO' as const },
    { dbName: 'Tiro Certeiro', polarity: 'DIRETO' as const }
];

export class SeparacaoAguasV2 {
    name = "Separação das Águas 2.0";
    description = "Ensemble de 5 Especialistas com Inversão Cirúrgica de Polaridade para Máxima Assimetria";

    combineSpecialists(specialistPredictions: { name: string; prediction: number[] }[], totalBalls: number): number[] {
        const scores = new Float32Array(totalBalls + 1);

        for (const spec of SEPARACAO_AGUAS_V2_CONFIG) {
            const found = specialistPredictions.find(s => s.name === spec.dbName || s.name.includes(spec.dbName));
            if (!found || !found.prediction || found.prediction.length < totalBalls) {
                continue;
            }
            const pred = found.prediction;
            const isDirect = spec.polarity === 'DIRETO';

            if (isDirect) {
                for (let rank = 0; rank < totalBalls; rank++) {
                    scores[pred[rank]] += (totalBalls - rank);
                }
            } else {
                for (let rank = 0; rank < totalBalls; rank++) {
                    scores[pred[rank]] += (rank + 1);
                }
            }
        }

        const rankedBalls: number[] = [];
        for (let b = 1; b <= totalBalls; b++) rankedBalls.push(b);
        rankedBalls.sort((a, b) => scores[b] - scores[a]);

        return rankedBalls;
    }
}
