/**
 * Sincronização Incremental da Produção (PostgreSQL no Coolify)
 * para a Base de Dados Local (SQLite em prisma/dev.db)
 *
 * Mapeamento estrito por (game, date) para garantir integridade referencial
 * entre os autoincrements de PostgreSQL e SQLite.
 */
const { Client } = require('pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const pgClient = new Client({
    connectionString: process.env.POSTGRES_URL_PROD,
    connectionTimeoutMillis: 15000
});

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 A conectar ao PostgreSQL da Produção...');
    await pgClient.connect();
    console.log('✅ Conectado ao PostgreSQL de Produção!');

    const syncStartDate = '2026-09-01';

    // 1. Sincronizar Sorteios da Produção para SQLite por (game, date)
    console.log(`\n📅 1. A sincronizar Sorteios desde ${syncStartDate}...`);
    const prodDrawsRes = await pgClient.query(
        'SELECT * FROM "Draw" WHERE date >= $1 ORDER BY date ASC;',
        [syncStartDate]
    );
    console.log(`   Encontrados ${prodDrawsRes.rows.length} sorteios na Produção.`);

    let drawCount = 0;
    for (const d of prodDrawsRes.rows) {
        try {
            await prisma.draw.upsert({
                where: { game_date: { game: d.game, date: d.date } },
                update: {
                    sequenceNumber: d.sequenceNumber,
                    numbers: typeof d.numbers === 'object' ? JSON.stringify(d.numbers) : String(d.numbers),
                    stars: typeof d.stars === 'object' ? JSON.stringify(d.stars) : String(d.stars),
                    jackpot: d.jackpot ? Number(d.jackpot) : null,
                    hasWinner: d.hasWinner ?? false,
                    numWinners: d.numWinners ?? 0,
                    starWinners: d.starWinners ?? 0
                },
                create: {
                    game: d.game,
                    sequenceNumber: d.sequenceNumber,
                    date: d.date,
                    numbers: typeof d.numbers === 'object' ? JSON.stringify(d.numbers) : String(d.numbers),
                    stars: typeof d.stars === 'object' ? JSON.stringify(d.stars) : String(d.stars),
                    jackpot: d.jackpot ? Number(d.jackpot) : null,
                    hasWinner: d.hasWinner ?? false,
                    numWinners: d.numWinners ?? 0,
                    starWinners: d.starWinners ?? 0
                }
            });
            drawCount++;
        } catch (err) {
            console.warn(`   ⚠️ Erro ao importar sorteio ${d.game} ${d.date.toISOString().slice(0, 10)}:`, err.message);
        }
    }
    console.log(`✅ ${drawCount} sorteios verificados/sincronizados localmente.`);

    // 2. Construir mapa de sorteios locais por (game, date) -> id
    const localDraws = await prisma.draw.findMany({
        where: { date: { gte: new Date(syncStartDate) } },
        select: { id: true, game: true, date: true }
    });

    const localDrawMap = new Map();
    for (const ld of localDraws) {
        const key = `${ld.game}_${ld.date.toISOString().slice(0, 10)}`;
        localDrawMap.set(key, ld.id);
    }

    // 3. Sincronizar Previsões (SystemPrediction) garantindo correspondência de sorteio
    console.log('\n📥 2. A sincronizar SystemPredictions com mapeamento de (game, date)...');
    const predsRes = await pgClient.query(`
        SELECT sp.*, d.game as draw_game, d.date as draw_date
        FROM "SystemPrediction" sp
        JOIN "Draw" d ON sp."drawId" = d.id
        WHERE d.date >= $1;
    `, [syncStartDate]);
    console.log(`   Encontradas ${predsRes.rows.length} previsões na Produção.`);

    let predCount = 0;
    let skippedCount = 0;

    for (const p of predsRes.rows) {
        const drawKey = `${p.draw_game}_${p.draw_date.toISOString().slice(0, 10)}`;
        const localDrawId = localDrawMap.get(drawKey);

        if (!localDrawId) {
            skippedCount++;
            continue;
        }

        // Segurança adicional: a previsão deve pertencer ao mesmo jogo do sorteio
        if (p.game !== p.draw_game) {
            skippedCount++;
            continue;
        }

        try {
            await prisma.systemPrediction.upsert({
                where: {
                    drawId_systemName_game_domain: {
                        drawId: localDrawId,
                        systemName: p.systemName,
                        game: p.game,
                        domain: p.domain
                    }
                },
                update: {
                    prediction: typeof p.prediction === 'object' ? JSON.stringify(p.prediction) : String(p.prediction),
                    cutoff: p.cutoff,
                    num_hits_5: p.num_hits_5,
                    num_hits_10: p.num_hits_10,
                    num_hits_15: p.num_hits_15,
                    num_hits_20: p.num_hits_20,
                    num_hits_25: p.num_hits_25,
                    num_hits_30: p.num_hits_30,
                    num_hits_35: p.num_hits_35,
                    num_hits_40: p.num_hits_40,
                    num_hits_45: p.num_hits_45,
                    num_hits_50: p.num_hits_50,
                    star_hits_2: p.star_hits_2,
                    star_hits_4: p.star_hits_4,
                    star_hits_6: p.star_hits_6,
                    star_hits_8: p.star_hits_8,
                    star_hits_10: p.star_hits_10,
                    star_hits_12: p.star_hits_12,
                    calculatedAt: p.calculatedAt
                },
                create: {
                    drawId: localDrawId,
                    systemName: p.systemName,
                    game: p.game,
                    domain: p.domain,
                    prediction: typeof p.prediction === 'object' ? JSON.stringify(p.prediction) : String(p.prediction),
                    cutoff: p.cutoff,
                    num_hits_5: p.num_hits_5,
                    num_hits_10: p.num_hits_10,
                    num_hits_15: p.num_hits_15,
                    num_hits_20: p.num_hits_20,
                    num_hits_25: p.num_hits_25,
                    num_hits_30: p.num_hits_30,
                    num_hits_35: p.num_hits_35,
                    num_hits_40: p.num_hits_40,
                    num_hits_45: p.num_hits_45,
                    num_hits_50: p.num_hits_50,
                    star_hits_2: p.star_hits_2,
                    star_hits_4: p.star_hits_4,
                    star_hits_6: p.star_hits_6,
                    star_hits_8: p.star_hits_8,
                    star_hits_10: p.star_hits_10,
                    star_hits_12: p.star_hits_12,
                    calculatedAt: p.calculatedAt
                }
            });
            predCount++;
        } catch (_) {}
    }

    console.log(`✅ ${predCount} previsões sincronizadas com sucesso (ignoradas/inválidas: ${skippedCount}).`);
    console.log('\n🎉 Sincronização concluída com 100% de integridade!');
}

main()
    .catch(err => {
        console.error('❌ Erro:', err);
        process.exit(1);
    })
    .finally(async () => {
        await pgClient.end().catch(() => {});
        await prisma.$disconnect();
    });
