const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fetch all draws from Caixa API to assign correct sequenceNumbers
async function fetchDraw(num) {
    return new Promise((resolve, reject) => {
        https.get(`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${num}`, { timeout: 8000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) try { resolve(JSON.parse(data)); } catch { resolve(null); }
                else resolve(null);
            });
        }).on('error', () => resolve(null)).on('timeout', () => resolve(null));
    });
}

function parseDate(str) {
    const [d, m, y] = str.split('/');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 12, 0, 0);
}

async function main() {
    // Fetch concursos in batches and assign sequenceNumber to matching DB draws
    const all = await prisma.draw.findMany({
        where: { game: 'MEGASENA' },
        select: { id: true, date: true, sequenceNumber: true },
        orderBy: { date: 'asc' }
    });

    // Build a map: date string -> draw id
    const dateToId = {};
    all.forEach(d => {
        const dt = new Date(d.date);
        dateToId[dt.toISOString().split('T')[0]] = { id: d.id, seq: d.sequenceNumber };
    });

    console.log("Total draws:", all.length);
    console.log("Assigning sequence numbers from API (this takes a while)...");

    let updated = 0;
    const BATCH = 20;
    
    for (let n = 1; n <= 3018; n += BATCH) {
        const promises = [];
        for (let i = n; i < Math.min(n + BATCH, 3019); i++) {
            promises.push(fetchDraw(i).then(d => ({ n: i, d })));
        }
        const results = await Promise.all(promises);
        
        for (const { n: num, d } of results) {
            if (!d) continue;
            const date = parseDate(d.dataApuracao).toISOString().split('T')[0];
            const entry = dateToId[date];
            if (entry && entry.seq !== num) {
                await prisma.draw.update({
                    where: { id: entry.id },
                    data: { sequenceNumber: num }
                });
                updated++;
            }
        }
        
        if (n % 200 === 1) console.log("  Processed up to " + (n + BATCH - 1) + "... (" + updated + " updated)");
    }

    console.log("\nDone! Updated sequenceNumber for", updated, "draws.");

    const withSeq = await prisma.draw.count({ where: { game: 'MEGASENA', sequenceNumber: { not: null } } });
    console.log("Total with sequenceNumber now:", withSeq);

    await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); });
