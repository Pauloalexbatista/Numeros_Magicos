import { Draw } from '@prisma/client';

/**
 * Vortex Multi-Channel System
 * 
 * Concept: Instead of tracing a single diagonal line, we trace MULTIPLE lines
 * creating "energy channels". When multiple channels align on the same number,
 * it creates a STRONG signal.
 * 
 * Think of it like radio antennas with multiple bands - each channel captures
 * patterns at different scales:
 * - Channel 1 (step=1): Short-term patterns
 * - Channel 2 (step=2): Medium-term patterns  
 * - Channel 3 (step=3): Long-term patterns
 */

export class VortexMultiChannelSystem {
    name: string;
    description: string;
    private channels: number;
    private weights: number[];

    constructor(channels: number = 2) {
        this.channels = channels;
        this.name = `Vortex Multi-Canal (${channels} canais)`;
        this.description = `Vortex com ${channels} linhas diagonais (canais de energia)`;

        // Define weights for each channel (all equal now)
        // All channels have the same importance
        if (channels === 2) {
            this.weights = [1.0, 1.0];
        } else if (channels === 3) {
            this.weights = [1.0, 1.0, 1.0];
        } else if (channels === 4) {
            this.weights = [1.0, 1.0, 1.0, 1.0];
        } else {
            // Default: all equal
            this.weights = Array.from({ length: channels }, () => 1.0);
        }
    }

    /**
     * Analyze resonance for all numbers (1-50) using multi-channel approach
     * Returns detailed scores for visualization
     */
    analyzeResonance(history: Draw[]): { num: number, score: number, channelScores?: number[] }[] {
        if (history.length === 0) return [];

        // Helper to parse numbers
        const parseNumbers = (draw: Draw): number[] => {
            if (typeof draw.numbers === 'string') return JSON.parse(draw.numbers);
            return draw.numbers as unknown as number[];
        };

        const candidates: { num: number, score: number, channelScores: number[] }[] = [];

        for (let candidate = 1; candidate <= 50; candidate++) {
            let totalScore = 0;
            const channelScores: number[] = [];

            // For each channel (diagonal line)
            for (let channel = 1; channel <= this.channels; channel++) {
                let channelScore = 0;

                // Trace Left Diagonal with step = channel
                let currentNum = candidate;
                for (let i = history.length - 1; i >= 0; i--) {
                    const draw = history[i];
                    const drawnNumbers = parseNumbers(draw);

                    // Move Left with step = channel
                    currentNum = currentNum - channel;
                    if (currentNum < 1) currentNum += 50; // Wrap around

                    if (drawnNumbers.includes(currentNum)) {
                        channelScore++;
                    }
                }

                // Trace Right Diagonal with step = channel
                currentNum = candidate;
                for (let i = history.length - 1; i >= 0; i--) {
                    const draw = history[i];
                    const drawnNumbers = parseNumbers(draw);

                    // Move Right with step = channel
                    currentNum = currentNum + channel;
                    if (currentNum > 50) currentNum -= 50; // Wrap around

                    if (drawnNumbers.includes(currentNum)) {
                        channelScore++;
                    }
                }

                // Apply channel weight
                const weightedScore = channelScore * this.weights[channel - 1];
                channelScores.push(channelScore);
                totalScore += weightedScore;
            }

            candidates.push({
                num: candidate,
                score: totalScore,
                channelScores
            });
        }

        // Sort by score descending
        candidates.sort((a, b) => b.score - a.score);
        return candidates;
    }

    async generateTop10(history: Draw[]): Promise<number[]> {
        const candidates = this.analyzeResonance(history);

        // Return Top 25
        const result = candidates.slice(0, 25).map(c => c.num);

        // Ensure exactly 25 numbers (Safety Check)
        if (result.length < 25) {
            const parseNumbers = (draw: Draw): number[] => {
                if (typeof draw.numbers === 'string') return JSON.parse(draw.numbers);
                return draw.numbers as unknown as number[];
            };

            const frequency: Record<number, number> = {};
            history.forEach(draw => {
                const nums = parseNumbers(draw);
                nums.forEach((n: number) => frequency[n] = (frequency[n] || 0) + 1);
            });

            const sortedByFreq = Object.entries(frequency)
                .sort(([, a], [, b]) => b - a)
                .map(([num]) => parseInt(num));

            for (const num of sortedByFreq) {
                if (result.length >= 25) break;
                if (!result.includes(num)) result.push(num);
            }

            // Fallback
            if (result.length < 25) {
                for (let i = 1; i <= 50; i++) {
                    if (result.length >= 25) break;
                    if (!result.includes(i)) result.push(i);
                }
            }
        }

        return result;
    }
}
