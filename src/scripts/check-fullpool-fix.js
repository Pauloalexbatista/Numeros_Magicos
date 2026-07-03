require('dotenv').config();
const { PrismaClient } = require('@prisma/client-prod');

const prodUrl = process.env.POSTGRES_URL_PROD || 'postgresql://admin_magico:UmaSenhaForte123@172.16.16.6:5432/numeros_magicos_prod?connection_limit=1';

const prisma = new PrismaClient({ datasources: { db: { url: prodUrl } } });

async function check(game, maxPool) {
    const draws = await prisma.draw.findMany({ where: { game }, orderBy: { date: 'desc' }, take: 5 });
    let allOk = true;
    for (const draw of draws) {
        const actual = JSON.parse(draw.numbers);
        const entries = await prisma.systemPerformanceFullPool.findMany({ where: { drawId: draw.id } });
        let bad = 0, sizes = [];
        for (const e of entries) {
            const pool = JSON.parse(e.predictedNumbers);
            sizes.push(pool.length);
            if (actual.filter(n => !pool.includes(n)).length > 0) bad++;
        }
        const minP = sizes.length ? Math.min(...sizes) : 0;
        const maxP = sizes.length ? Math.max(...sizes) : 0;
        const status = bad === 0 ? 'OK' : 'ERRO:' + bad + '/' + entries.length + ' com numeros em falta';
        console.log('  ' + draw.date.toISOString().split('T')[0] + ': ' + entries.length + ' entradas | pool:' + minP + '-' + maxP + '/' + maxPool + ' | ' + status);
        if (bad > 0) allOk = false;
    }
    return allOk;
}

async function main() {
    try {
        console.log('\n=== EURODREAMS (pool deve ser 40) ===');
        const edOk = await check('EURODREAMS', 40);
        console.log('\n=== TOTOLOTO (pool deve ser 49) ===');
        const totoOk = await check('TOTOLOTO', 49);
        console.log('\n=== EUROMILLIONS (pool deve ser 50) ===');
        const emOk = await check('EUROMILLIONS', 50);
        console.log('\n=== MEGASENA (pool deve ser 60) ===');
        const msOk = await check('MEGASENA', 60);
        console.log('\n===== RESUMO =====');
        console.log('EURODREAMS:   ' + (edOk ? 'OK' : 'AINDA COM ERROS'));
        console.log('TOTOLOTO:     ' + (totoOk ? 'OK' : 'AINDA COM ERROS'));
        console.log('EUROMILLIONS: ' + (emOk ? 'OK' : 'AINDA COM ERROS'));
        console.log('MEGASENA:     ' + (msOk ? 'OK' : 'AINDA COM ERROS'));
    } catch(e) { console.error('Erro:', e.message); }
    finally { await prisma.$disconnect(); }
}
main();
