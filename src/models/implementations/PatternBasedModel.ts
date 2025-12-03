import { Draw, PredictionModel, PredictionResult } from '../types';
import { calculateAmplitude, classifyAmplitude, getPyramidRecommendations } from '../../services/statistics';
import { SeededRNG } from '../../utils/seeded-rng';

export class PatternBasedModel implements PredictionModel {
    id = 'pattern_based';
    name = 'Baseado em Padrões (Amplitude/Pirâmide)';
    description = 'Usa análise de Amplitude e Totais de Pirâmide para selecionar números com maior potencial.';

    predict(history: Draw[], predictionSize: number = 5): PredictionResult {
        // Parse numbers if they are strings (Prisma issue)
        const parsedHistory = history.map(draw => ({
            ...draw,
            numbers: typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers
        }));

        // Use parsedHistory for all subsequent operations
        history = parsedHistory;

        // 1. Get Pyramid Recommendations (High potential numbers based on neighborhood)
        const recCount = Math.max(40, predictionSize + 10);
        const pyramidRecs = getPyramidRecommendations(history, recCount);
        const candidateNumbers = pyramidRecs.map(r => r.number);

        // 2. Generate combinations from candidates and filter by Amplitude
        let bestCombination: number[] = [];
        let bestScore = -Infinity;

        // Initialize Seeded RNG based on last draw
        const lastDraw = history[0];
        const seedStr = lastDraw ? `${lastDraw.id}-${lastDraw.date}` : 'default-seed';
        const rng = new SeededRNG(seedStr);

        const attempts = 1000;

        for (let i = 0; i < attempts; i++) {
            // Shuffle and pick N
            const shuffled = [...candidateNumbers].sort(() => rng.next() - 0.5);
            const selection = shuffled.slice(0, predictionSize).sort((a, b) => a - b);

            // If we don't have enough candidates, fill with randoms
            while (selection.length < predictionSize) {
                const r = rng.nextInt(1, 50);
                if (!selection.includes(r)) selection.push(r);
            }
            selection.sort((a, b) => a - b);

            // Calculate Amplitude
            const amp = calculateAmplitude(selection);
            const classification = classifyAmplitude(amp);

            // Score the combination
            let score = 0;

            // Amplitude Score
            if (classification === 'Normal') score += 100;
            else if (amp >= 20 && amp <= 50) score += 50; // Acceptable range
            else score -= 50; // Too concentrated or too dispersed

            // Pyramid Score (Sum of totals)
            const pyramidScore = selection.reduce((sum, num) => {
                const rec = pyramidRecs.find(r => r.number === num);
                return sum + (rec ? rec.total : 0);
            }, 0);

            score += pyramidScore;

            if (score > bestScore) {
                bestScore = score;
                bestCombination = selection;
            }
        }

        // Final check to ensure size
        if (bestCombination.length < predictionSize) {
            const allNums = Array.from({ length: 50 }, (_, i) => i + 1);
            for (const n of allNums) {
                if (bestCombination.length >= predictionSize) break;
                if (!bestCombination.includes(n)) bestCombination.push(n);
            }
        }

        // Generate reasoning
        const amp = calculateAmplitude(bestCombination);
        const ampClass = classifyAmplitude(amp);
        const reasoning = `Padrão: Amplitude ${amp} (${ampClass}). Baseado nos top ${candidateNumbers.length} da Pirâmide.`;

        return {
            numbers: bestCombination,
            reasoning
        };
    }
}
