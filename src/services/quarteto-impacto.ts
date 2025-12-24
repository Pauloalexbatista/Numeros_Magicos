import { Draw } from '@prisma/client';
import { PyramidPascalSystem } from './pyramid-pascal';
import { ElasticModel } from '../models/implementations/ElasticModel';
import { RandomSystem } from './random-system';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUARTETO DE IMPACTO - Sistema Ensemble Balanceado
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 🎯 COMPOSIÇÃO:
 * 1. Hot Numbers (via StatefulHotNumbers - mas aqui usamos lógica simples)
 * 2. Pyramid Pascal
 * 3. Sistema Elástico
 * 4. Random Generator
 * 
 * 💡 ESTRATÉGIA:
 * - Votação ponderada entre sistemas estatísticos e aleatórios
 * - Combina frequência, padrões geométricos, elasticidade e aleatoriedade
 * ═══════════════════════════════════════════════════════════════════════════
 */

export class QuartetoDeImpacto {
    name = 'Quarteto de Impacto';
    description = 'Ensemble balanceado (Hot, Pascal, Elastic, Random)';

    /**
     * Gera Top 25 números através de votação ponderada
     */
    async generateTop25(history: Draw[]): Promise<number[]> {
        if (history.length < 10) {
            return Array.from({ length: 25 }, (_, i) => i + 1);
        }

        const systems = [
            new PyramidPascalSystem(),
            new ElasticModel(),
            new RandomSystem()
        ];

        // Hot Numbers (lógica simples)
        const hotNumbers = this.getHotNumbers(history);

        const predictions = await Promise.all(
            systems.map(sys => sys.generateTop10(history))
        );

        // Adicionar hot numbers
        predictions.unshift(hotNumbers.slice(0, 25));

        const votes = new Map<number, number>();
        predictions.forEach(pred => {
            pred.forEach(num => {
                votes.set(num, (votes.get(num) || 0) + 1);
            });
        });

        const sortedByVotes = Array.from(votes.entries())
            .sort(([, vA], [, vB]) => vB - vA);

        const result = sortedByVotes.map(([num]) => num).slice(0, 25);

        // Garantir 25 números
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

    private getHotNumbers(history: Draw[]): number[] {
        const frequency = new Map<number, number>();

        // Contar últimos 100 sorteios
        const recent = history.slice(0, Math.min(100, history.length));

        recent.forEach(draw => {
            const numbers = typeof draw.numbers === 'string'
                ? JSON.parse(draw.numbers)
                : draw.numbers as number[];

            numbers.forEach(num => {
                frequency.set(num, (frequency.get(num) || 0) + 1);
            });
        });

        return Array.from(frequency.entries())
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => num);
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUARTETO DE IMPACTO (Hot + Pascal + Elastic + Random) - Variante Explícita
 * ═══════════════════════════════════════════════════════════════════════════
 */

export class QuartetoDeImpactoV2 {
    name = 'Quarteto de Impacto (Hot + Pascal + Elastic + Random)';
    description = 'Ensemble balanceado (Hot Numbers + Pyramid Pascal + Elastic + Random)';

    async generateTop25(history: Draw[]): Promise<number[]> {
        if (history.length < 10) {
            return Array.from({ length: 25 }, (_, i) => i + 1);
        }

        const systems = [
            new PyramidPascalSystem(),
            new ElasticModel(),
            new RandomSystem()
        ];

        const hotNumbers = this.getHotNumbers(history);
        const predictions = await Promise.all(
            systems.map(sys => sys.generateTop10(history))
        );

        predictions.unshift(hotNumbers.slice(0, 25));

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

    private getHotNumbers(history: Draw[]): number[] {
        const frequency = new Map<number, number>();
        const recent = history.slice(0, Math.min(100, history.length));

        recent.forEach(draw => {
            const numbers = typeof draw.numbers === 'string'
                ? JSON.parse(draw.numbers)
                : draw.numbers as number[];

            numbers.forEach(num => {
                frequency.set(num, (frequency.get(num) || 0) + 1);
            });
        });

        return Array.from(frequency.entries())
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => num);
    }
}

export default QuartetoDeImpacto;

