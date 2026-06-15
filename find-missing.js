const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fetchDraw(num) {
    return new Promise((resolve, reject) => {
        https.get(`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${num}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) resolve(JSON.parse(data));
                else resolve(null);
            });
        }).on('error', reject);
    });
}

function parseDate(str) {
    // "14/06/2026" -> Date
    const [d, m, y] = str.split('/');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 12, 0, 0);
}

async function main() {
    // Get all dates currently in DB
    const existing = await prisma.draw.findMany({ 
        where: { game: 'MEGASENA' }, 
        select: { date: true, numbers: true },
        orderBy: { date: 'asc' }
    });

    const existingDates = new Set(existing.map(d => {
        const dt = new Date(d.date);
        return dt.toISOString().split('T')[0];
    }));
    
    console.log("Total na BD actualmente:", existing.length);
    console.log("Ultimo concurso na API: 3018 (14/06/2026)");
    console.log("\nA verificar sorteios 1 a 3018...");

    // Fetch all concursos that are missing
    // We know our DB has 3017 records, concurso goes up to 3018
    // So we need to figure out which dates we are missing
    // Let's fetch concursos from ~2900 to 3018 and find gaps
    
    let missing = [];
    let found = 0;
    
    for (let n = 2850; n <= 3018; n++) {
        const d = await fetchDraw(n);
        if (!d) continue;
        
        const date = parseDate(d.dataApuracao).toISOString().split('T')[0];
        if (!existingDates.has(date)) {
            missing.push({
                concurso: n,
                date: date,
                numbers: d.listaDezenas.map(Number).sort((a,b) => a-b).join(',')
            });
            console.log("FALTA concurso " + n + " | " + date + " | " + d.listaDezenas.join(','));
        }
        found++;
        if(found % 50 === 0) process.stdout.write('.');
    }
    
    console.log("\n\nTotal em falta (2850-3018):", missing.length);
    console.log("Em falta:", JSON.stringify(missing, null, 2));
    
    await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); });
