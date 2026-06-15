const https = require('https');

async function fetch(num) {
    return new Promise((resolve, reject) => {
        https.get(`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${num}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', reject);
    });
}

async function findLatest() {
    // We know 2990 works, 3020 doesn't. Binary search.
    let lo = 2990, hi = 3020;
    while (lo < hi - 1) {
        const mid = Math.floor((lo + hi) / 2);
        const r = await fetch(mid);
        if (r.status === 200) lo = mid;
        else hi = mid;
    }
    const r = await fetch(lo);
    const d = JSON.parse(r.data);
    console.log("ULTIMO CONCURSO:", lo);
    console.log("Data:", d.dataApuracao);
    console.log("Numeros:", d.listaDezenas.join(','));
    console.log("Proximo:", d.numeroConcursoProximo);
}
findLatest();
