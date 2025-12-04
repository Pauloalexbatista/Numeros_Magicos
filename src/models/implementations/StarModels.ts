
import { Draw, PredictionModel, PredictionResult } from '../types';

export class HotStarsModel implements PredictionModel {
    id = 'hot_stars';
    name = 'Estrelas Quentes';
    description = 'Escolhe as estrelas mais frequentes do histórico disponível.';

    predict(history: Draw[], predictionSize: number = 2): PredictionResult {
        // Calculate frequency
        const frequency: Record<number, number> = {};
        history.forEach(draw => {
            draw.stars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        // Sort by frequency (descending)
        const sortedStars = Object.entries(frequency)
            .map(([star, freq]) => ({ star: parseInt(star), freq }))
            .sort((a, b) => b.freq - a.freq);

        // Pick top N
        const topStars = sortedStars.slice(0, predictionSize).map(item => item.star);

        // Fill if needed (shouldn't happen with 12 stars)
        while (topStars.length < predictionSize) {
            const star = Math.floor(Math.random() * 12) + 1;
            if (!topStars.includes(star)) {
                topStars.push(star);
            }
        }

        const reasoning = `Top ${predictionSize} Estrelas: ${sortedStars.slice(0, predictionSize).map(i => `★${i.star} (${i.freq}x)`).join(', ')}`;

        return {
            numbers: [], // This model only predicts stars
            stars: topStars.sort((a, b) => a - b),
            reasoning
        };
    }
}

export class ColdStarsModel implements PredictionModel {
    id = 'cold_stars';
    name = 'Estrelas Frias';
    description = 'Escolhe as estrelas menos frequentes (mais atrasadas) do histórico.';

    predict(history: Draw[], predictionSize: number = 2): PredictionResult {
        // Calculate frequency
        const frequency: Record<number, number> = {};
        // Initialize all stars 1-12 with 0
        for (let i = 1; i <= 12; i++) frequency[i] = 0;

        history.forEach(draw => {
            draw.stars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        // Sort by frequency (ascending)
        const sortedStars = Object.entries(frequency)
            .map(([star, freq]) => ({ star: parseInt(star), freq }))
            .sort((a, b) => a.freq - b.freq);

        // Pick top N
        const topStars = sortedStars.slice(0, predictionSize).map(item => item.star);

        const reasoning = `Top ${predictionSize} Estrelas Frias: ${sortedStars.slice(0, predictionSize).map(i => `★${i.star} (${i.freq}x)`).join(', ')}`;

        return {
            numbers: [],
            stars: topStars.sort((a, b) => a - b),
            reasoning
        };
    }
}

export class RandomStarsModel implements PredictionModel {
    id = 'random_stars';
    name = 'Estrelas Aleatórias';
    description = 'Gera estrelas aleatórias (Baseline).';

    predict(history: Draw[], predictionSize: number = 2): PredictionResult {
        const stars: number[] = [];
        while (stars.length < predictionSize) {
            const star = Math.floor(Math.random() * 12) + 1;
            if (!stars.includes(star)) {
                stars.push(star);
            }
        }

        return {
            numbers: [],
            stars: stars.sort((a, b) => a - b),
            reasoning: 'Seleção aleatória.'
        };
    }
}
