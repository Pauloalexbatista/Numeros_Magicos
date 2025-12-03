export function hypergeometricProbability(k: number, K: number, N: number, n: number): number {
    // Probability of drawing exactly k successes (matches) when drawing n items from a population of N
    // where K items are considered successes (the actual drawn numbers).
    // Formula: C(K, k) * C(N - K, n - k) / C(N, n)
    const combination = (a: number, b: number): number => {
        if (b < 0 || b > a) return 0;
        if (b === 0 || b === a) return 1;
        b = Math.min(b, a - b);
        let result = 1;
        for (let i = 1; i <= b; i++) {
            result = result * (a - b + i) / i;
        }
        return result;
    };
    const numerator = combination(K, k) * combination(N - K, n - k);
    const denominator = combination(N, n);
    return numerator / denominator;
}
