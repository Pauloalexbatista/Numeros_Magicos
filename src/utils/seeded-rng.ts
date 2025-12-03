/**
 * Simple Seeded RNG
 * Uses a string seed (e.g. from history) to generate deterministic random numbers.
 */
export class SeededRNG {
    private seed: number;

    constructor(seedStr: string) {
        this.seed = this.cyrb128(seedStr);
    }

    // Cypher hash to turn string into number
    private cyrb128(str: string): number {
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
    }

    // Returns a number between 0 (inclusive) and 1 (exclusive)
    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    // Returns integer between min (inclusive) and max (inclusive)
    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}
