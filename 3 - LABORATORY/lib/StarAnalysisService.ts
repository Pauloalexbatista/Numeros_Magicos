import { prisma } from './prisma';

export interface StarPattern {
    pattern: string;
    frequency: number;
    lastSeen: number;
    avgGap: number;
    successRate: number;
}

export interface StarPairAnalysis {
    pair: [number, number];
    frequency: number;
    lastSeen: number;
    correlation: number;
}

export interface StarPositionAnalysis {
    star: number;
    position1Freq: number;
    position2Freq: number;
    preferredPosition: 'first' | 'second' | 'both';
}

export class StarAnalysisService {

    /**
     * Parse stars from string format "[1,2]" to array [1, 2]
     */
    private static parseStars(starsString: string): number[] {
        try {
            return JSON.parse(starsString);
        } catch {
            return [];
        }
    }

    /**
     * Analyze star pair correlations
     * Find which stars appear together most frequently
     */
    static async analyzePairCorrelations(limit: number = 100): Promise<StarPairAnalysis[]> {
        const draws = await prisma.draw.findMany({
            orderBy: { id: 'desc' },
            take: limit,
        });

        const pairFrequency = new Map<string, number>();
        const pairLastSeen = new Map<string, number>();

        draws.forEach((draw, index) => {
            const stars = this.parseStars(draw.stars).sort((a, b) => a - b);
            if (stars.length !== 2) return;

            const key = `${stars[0]}-${stars[1]}`;

            pairFrequency.set(key, (pairFrequency.get(key) || 0) + 1);

            if (!pairLastSeen.has(key)) {
                pairLastSeen.set(key, index);
            }
        });

        const results: StarPairAnalysis[] = [];

        pairFrequency.forEach((frequency, key) => {
            const [s1, s2] = key.split('-').map(Number);
            results.push({
                pair: [s1, s2],
                frequency,
                lastSeen: pairLastSeen.get(key) || 0,
                correlation: frequency / limit,
            });
        });

        return results.sort((a, b) => b.frequency - a.frequency).slice(0, 20);
    }

    /**
     * Analyze positional preferences
     * Check if stars prefer position 1 or 2
     */
    static async analyzePositionalPreference(limit: number = 200): Promise<StarPositionAnalysis[]> {
        const draws = await prisma.draw.findMany({
            orderBy: { id: 'desc' },
            take: limit,
        });

        const position1Count = new Map<number, number>();
        const position2Count = new Map<number, number>();

        draws.forEach(draw => {
            const stars = this.parseStars(draw.stars);
            if (stars.length !== 2) return;

            position1Count.set(stars[0], (position1Count.get(stars[0]) || 0) + 1);
            position2Count.set(stars[1], (position2Count.get(stars[1]) || 0) + 1);
        });

        const results: StarPositionAnalysis[] = [];

        for (let star = 1; star <= 12; star++) {
            const pos1 = position1Count.get(star) || 0;
            const pos2 = position2Count.get(star) || 0;
            const total = pos1 + pos2;

            let preferred: 'first' | 'second' | 'both' = 'both';
            if (total > 0) {
                const ratio = pos1 / total;
                if (ratio > 0.65) preferred = 'first';
                else if (ratio < 0.35) preferred = 'second';
            }

            results.push({
                star,
                position1Freq: pos1,
                position2Freq: pos2,
                preferredPosition: preferred,
            });
        }

        return results.sort((a, b) =>
            (b.position1Freq + b.position2Freq) - (a.position1Freq + a.position2Freq)
        );
    }

    /**
     * Analyze sequential patterns
     * Find if certain stars follow others
     */
    static async analyzeSequentialPatterns(limit: number = 150): Promise<Map<number, Map<number, number>>> {
        const draws = await prisma.draw.findMany({
            orderBy: { id: 'desc' },
            take: limit,
        });

        const transitions = new Map<number, Map<number, number>>();

        for (let i = 0; i < draws.length - 1; i++) {
            const currentStars = this.parseStars(draws[i].stars);
            const nextStars = this.parseStars(draws[i + 1].stars);

            currentStars.forEach(current => {
                if (!transitions.has(current)) {
                    transitions.set(current, new Map());
                }
                const transitionMap = transitions.get(current)!;

                nextStars.forEach(next => {
                    transitionMap.set(next, (transitionMap.get(next) || 0) + 1);
                });
            });
        }

        return transitions;
    }

    /**
     * Analyze gap patterns
     * Find optimal delay before a star reappears
     */
    static async analyzeGapPatterns(star: number, limit: number = 300): Promise<{
        avgGap: number;
        minGap: number;
        maxGap: number;
        mostCommonGap: number;
        currentGap: number;
    }> {
        const draws = await prisma.draw.findMany({
            orderBy: { id: 'desc' },
            take: limit,
        });

        const appearances: number[] = [];
        draws.forEach((draw, index) => {
            const stars = this.parseStars(draw.stars);
            if (stars.includes(star)) {
                appearances.push(index);
            }
        });

        if (appearances.length < 2) {
            return {
                avgGap: 0,
                minGap: 0,
                maxGap: 0,
                mostCommonGap: 0,
                currentGap: appearances[0] || 0,
            };
        }

        const gaps: number[] = [];
        for (let i = 0; i < appearances.length - 1; i++) {
            gaps.push(appearances[i] - appearances[i + 1]);
        }

        const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        const minGap = Math.min(...gaps);
        const maxGap = Math.max(...gaps);

        // Find most common gap
        const gapFreq = new Map<number, number>();
        gaps.forEach(gap => gapFreq.set(gap, (gapFreq.get(gap) || 0) + 1));
        const mostCommonGap = Array.from(gapFreq.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

        return {
            avgGap: Math.round(avgGap * 10) / 10,
            minGap,
            maxGap,
            mostCommonGap,
            currentGap: appearances[0],
        };
    }

    /**
     * Analyze sum patterns
     * Check if star1 + star2 has patterns
     */
    static async analyzeSumPatterns(limit: number = 200): Promise<Map<number, number>> {
        const draws = await prisma.draw.findMany({
            orderBy: { id: 'desc' },
            take: limit,
        });

        const sumFrequency = new Map<number, number>();

        draws.forEach(draw => {
            const stars = this.parseStars(draw.stars);
            if (stars.length !== 2) return;

            const sum = stars[0] + stars[1];
            sumFrequency.set(sum, (sumFrequency.get(sum) || 0) + 1);
        });

        return new Map(
            Array.from(sumFrequency.entries()).sort((a, b) => b[1] - a[1])
        );
    }

    /**
     * Analyze odd/even patterns
     */
    static async analyzeOddEvenPatterns(limit: number = 200): Promise<{
        bothOdd: number;
        bothEven: number;
        mixed: number;
    }> {
        const draws = await prisma.draw.findMany({
            orderBy: { id: 'desc' },
            take: limit,
        });

        let bothOdd = 0;
        let bothEven = 0;
        let mixed = 0;

        draws.forEach(draw => {
            const stars = this.parseStars(draw.stars);
            if (stars.length !== 2) return;

            const s1Odd = stars[0] % 2 === 1;
            const s2Odd = stars[1] % 2 === 1;

            if (s1Odd && s2Odd) bothOdd++;
            else if (!s1Odd && !s2Odd) bothEven++;
            else mixed++;
        });

        return {
            bothOdd,
            bothEven,
            mixed,
        };
    }

    /**
     * Get current system performance for stars
     */
    static async getSystemPerformance() {
        const rankings = await prisma.starSystemRanking.findMany({
            orderBy: { avgAccuracy: 'desc' },
            take: 15,
        });

        return rankings.map(r => ({
            name: r.systemName,
            accuracy: r.avgAccuracy,
            jackpots: r.jackpots,
            score: r.totalHits,
        }));
    }
}
