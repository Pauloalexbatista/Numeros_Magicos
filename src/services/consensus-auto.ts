import { Draw } from '@prisma/client';
import { VortexPyramidSystem } from './vortex-pyramid';
import { SistMediaCamadas } from './custom/SistMediaCamadas';
import { SistCombinadoMedia3System } from './custom/SistCombinadoMedia3';
import { LSTMModel } from './ml/lstm';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONSENSUS AUTO - Sistema de Votação Ponderada Automática
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 🎯 VARIANTE 1: Vortex + Camadas + Media3
 * 🎯 VARIANTE 2: Vortex + LSTM + Media3
 * 
 * 💡 ESTRATÉGIA:
 * - Votação ponderada entre sistemas complementares
 * - Combina padrões vortex, camadas estatísticas e médias
 * ═══════════════════════════════════════════════════════════════════════════
 */

export class ConsensusAutoV1 {
    name = 'Consensus Auto (Vortex + Camadas + Media3)';
    description = 'Votação ponderada: Vortex Pyramid + Média Camadas + Media+3';

    async generateTop25(history: Draw[]): Promise<number[]> {
        if (history.length < 10) {
            return Array.from({ length: 25 }, (_, i) => i + 1);
        }

        const systems = [
            new VortexPyramidSystem(),
            new SistMediaCamadas(),
            new SistCombinadoMedia3System()
        ];

        const predictions = await Promise.all(
            systems.map(sys => sys.generateTop10(history))
        );

        const votes = new Map<number, number>();
        predictions.forEach(pred => {
            pred.forEach(num => {
                votes.set(num, (votes.get(num) || 0) + 1);
            });
        });

        const sortedByVotes = Array.from(votes.entries())
            .sort(([, vA], [, vB]) => vB - vA);

        const result = sortedByVotes.map(([num]) => num).slice(0, 25);

        if (result.length < 25) {
            for (let i = 1; i <= 50; i++) {
                if (result.length >= 25) break;
                if (!result.includes(i)) result.push(i);
            }
        }

        return result;
    }

    async generateTop10(history: Draw[]): Promise<number[]> {
        const top25 = await this.generateTop25(history);
        return top25.slice(0, 10);
    }
}

export class ConsensusAutoV2 {
    name = 'Consensus Auto (Vortex + LSTM + Media3)';
    description = 'Votação ponderada: Vortex Pyramid + LSTM + Media+3';

    async generateTop25(history: Draw[]): Promise<number[]> {
        if (history.length < 100) {
            return Array.from({ length: 25 }, (_, i) => i + 1);
        }

        const systems = [
            new VortexPyramidSystem(),
            new LSTMModel(),
            new SistCombinadoMedia3System()
        ];

        const predictions = await Promise.all(
            systems.map(sys => sys.generateTop10(history))
        );

        const votes = new Map<number, number>();
        predictions.forEach(pred => {
            pred.forEach(num => {
                votes.set(num, (votes.get(num) || 0) + 1);
            });
        });

        const sortedByVotes = Array.from(votes.entries())
            .sort(([, vA], [, vB]) => vB - vA);

        const result = sortedByVotes.map(([num]) => num).slice(0, 25);

        if (result.length < 25) {
            for (let i = 1; i <= 50; i++) {
                if (result.length >= 25) break;
                if (!result.includes(i)) result.push(i);
            }
        }

        return result;
    }

    async generateTop10(history: Draw[]): Promise<number[]> {
        const top25 = await this.generateTop25(history);
        return top25.slice(0, 10);
    }
}

export default ConsensusAutoV1;
