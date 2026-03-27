import { Draw } from '@prisma/client';

/**
 * SISTEMA OSCILAÇÃO UNIVERSAL
 * 
 * Baseado na descoberta: TODAS as raízes oscilam em ~74%
 * 
 * Estratégia:
 * 1. Analisar últimos 5-10 sorteios
 * 2. Identificar raízes "saturadas" (apareceram muito)
 * 3. Favorece raízes "carentes" (apareceram pouco)
 * 4. Usa oscilação de ~74% para prever
 */

export class UniversalOscillationSystem {
    name = "Sistema Oscilação Universal";
    description = "Explora oscilação de ~74% entre TODAS as raízes digitais";

    // Redução teosófica
    private getRoot(num: number): number {
        while (num > 9) {
            num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        }
        return num;
    }

    // Números de 1-50 por raiz
    private getNumbersByRoot(root: number): number[] {
        const numbers: number[] = [];
        for (let i = 1; i <= 50; i++) {
            if (this.getRoot(i) === root) {
                numbers.push(i);
            }
        }
        return numbers;
    }

    async generateTop10(history: Draw[]): Promise<number[]> {
        if (history.length < 10) {
            // Fallback: retorna números aleatórios
            return Array.from({ length: 25 }, (_, i) => i + 1);
        }

        // Analisar últimos 10 sorteios
        const recentDraws = history.slice(-10);

        // Contar frequência de cada raiz
        const rootFrequency: Record<number, number> = {};
        for (let i = 1; i <= 9; i++) rootFrequency[i] = 0;

        recentDraws.forEach(draw => {
            const nums = typeof draw.numbers === 'string'
                ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers)
                : draw.numbers as number[];

            nums.forEach((n: number) => {
                const root = this.getRoot(n);
                rootFrequency[root]++;
            });
        });

        // Total de números nos últimos 10 sorteios
        const totalNumbers = recentDraws.length * 5;

        // Calcular "saturação" de cada raiz
        // Saturação = quanto apareceu vs esperado
        const saturation: Record<number, number> = {};

        for (let root = 1; root <= 9; root++) {
            const numsWithRoot = this.getNumbersByRoot(root).length;
            const expected = (numsWithRoot / 50) * totalNumbers;
            const actual = rootFrequency[root];

            // Saturação > 1 = apareceu mais que esperado
            // Saturação < 1 = apareceu menos que esperado
            saturation[root] = expected > 0 ? actual / expected : 0;
        }

        // Calcular scores para todos os números
        const scores: { num: number, score: number }[] = [];

        for (let candidate = 1; candidate <= 50; candidate++) {
            const root = this.getRoot(candidate);

            // Score base: frequência no histórico completo
            const frequency = history.filter(draw => {
                const nums = typeof draw.numbers === 'string'
                    ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers)
                    : draw.numbers as number[];
                return nums.includes(candidate);
            }).length;

            let score = frequency;

            // BOOST: Se raiz está "carente" (saturação < 1)
            if (saturation[root] < 1) {
                // Quanto mais carente, maior o boost
                const boost = 2 - saturation[root]; // Ex: sat=0.5 → boost=1.5
                score *= boost;
            }

            // PENALIDADE: Se raiz está "saturada" (saturação > 1)
            if (saturation[root] > 1) {
                // Quanto mais saturada, maior a penalidade
                const penalty = 1 / saturation[root]; // Ex: sat=2 → penalty=0.5
                score *= penalty;
            }

            scores.push({ num: candidate, score });
        }

        // Ordenar por score
        scores.sort((a, b) => b.score - a.score);

        // Retornar top 25
        const result = scores.slice(0, 25).map(s => s.num);

        // Safety check
        if (result.length < 25) {
            for (let i = 1; i <= 50; i++) {
                if (result.length >= 25) break;
                if (!result.includes(i)) result.push(i);
            }
        }

        return result;
    }

    // Método auxiliar para debug
    async analyzeSaturation(history: Draw[]): Promise<{
        rootFrequency: Record<number, number>,
        saturation: Record<number, number>,
        recommendation: number[]
    }> {
        if (history.length < 10) {
            return {
                rootFrequency: {},
                saturation: {},
                recommendation: []
            };
        }

        const recentDraws = history.slice(-10);
        const rootFrequency: Record<number, number> = {};
        for (let i = 1; i <= 9; i++) rootFrequency[i] = 0;

        recentDraws.forEach(draw => {
            const nums = typeof draw.numbers === 'string'
                ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers)
                : draw.numbers as number[];

            nums.forEach((n: number) => {
                const root = this.getRoot(n);
                rootFrequency[root]++;
            });
        });

        const totalNumbers = recentDraws.length * 5;
        const saturation: Record<number, number> = {};

        for (let root = 1; root <= 9; root++) {
            const numsWithRoot = this.getNumbersByRoot(root).length;
            const expected = (numsWithRoot / 50) * totalNumbers;
            const actual = rootFrequency[root];
            saturation[root] = expected > 0 ? actual / expected : 0;
        }

        // Identificar raízes carentes (para recomendar)
        const carentes = Object.entries(saturation)
            .filter(([, sat]) => sat < 0.8)
            .sort(([, a], [, b]) => a - b)
            .slice(0, 3)
            .map(([root]) => root);

        const recommendation = carentes.flatMap(root =>
            this.getNumbersByRoot(parseInt(root))
        );

        return {
            rootFrequency,
            saturation,
            recommendation
        };
    }
}
