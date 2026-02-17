
function combinations(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;

    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
    }
    return res;
}

function hypergeometric(k: number, N: number, K: number, n: number): number {
    // k methods to choose successes * (n-k) methods to choose failures / total methods
    return (combinations(K, k) * combinations(N - K, n - k)) / combinations(N, n);
}

const configs = [
    { name: 'EUROMILLIONS', N: 50, K: 5, n: 25 },
    { name: 'TOTOLOTO', N: 49, K: 5, n: 25 },
    { name: 'EURODREAMS', N: 40, K: 6, n: 20 }
];

configs.forEach(cfg => {
    console.log(`\n${cfg.name} (N=${cfg.N}, K=${cfg.K}, n=${cfg.n}):`);
    let sum = 0;
    const probs = [];
    for (let k = 0; k <= cfg.K; k++) {
        const p = hypergeometric(k, cfg.N, cfg.K, cfg.n);
        sum += p;
        probs.push(p * 100);
        console.log(`  ${k} hits: ${(p * 100).toFixed(2)}%`);
    }
    console.log(`  Probs Array: [${probs.map(p => p.toFixed(1)).join(', ')}]`);
});
