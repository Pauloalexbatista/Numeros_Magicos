import { Draw } from '@prisma/client';
import { IPredictiveSystem } from '../ranked-systems';

export class mdiasemaspontasSystem implements IPredictiveSystem {
    name = "média sem as pontas";
    description = "Média aparada (sem extremos) por posição nos últimos 10 sorteios";

    async generateTop10(draws: Draw[]): Promise<number[]> {
        if (draws.length < 5) return Array.from({ length: 25 }, (_, i) => i + 1);

        const recentDraws = draws.slice(0, 10).map(d => {
            try {
                return typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers as number[];
            } catch {
                return [];
            }
        }).filter(n => n.length === 5);

        if (recentDraws.length < 3) return Array.from({ length: 25 }, (_, i) => i + 1);

        const candidates = new Set<number>();

        for (let pos = 0; pos < 5; pos++) {
            const values = recentDraws.map(d => d[pos]).sort((a, b) => a - b);

            // Remove as "pontas" (ex: se temos 10 sorteios, removemos 2 de cada lado)
            const trimSize = Math.max(1, Math.floor(values.length * 0.2));
            const trimmedValues = values.slice(trimSize, -trimSize);

            if (trimmedValues.length === 0) continue;

            const sum = trimmedValues.reduce((a, b) => a + b, 0);
            const mean = Math.round(sum / trimmedValues.length);

            // Adiciona a média e vizinhos diretos para cobertura
            candidates.add(mean);
            for (let offset = 1; offset <= 3; offset++) {
                if (mean - offset >= 1) candidates.add(mean - offset);
                if (mean + offset <= 50) candidates.add(mean + offset);
            }
        }

        // Preenche até 25 com números quentes se necessário
        let result = Array.from(candidates).sort((a, b) => a - b).slice(0, 25);

        if (result.length < 25) {
            for (let i = 1; i <= 50; i++) {
                if (result.length >= 25) break;
                if (!result.includes(i)) result.push(i);
            }
        }

        return result;
    }
}
