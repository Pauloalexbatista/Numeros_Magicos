import dotenv from 'dotenv';
dotenv.config();
import { Client } from 'pg';
import { prisma } from '../src/lib/prisma';

const SYSTEMS_TO_PUSH = [
    'Monte Carlo',
    'Agrupamento de Padrões (Clustering)',
    'Tiro Certeiro',
    'Separação das Águas',
    'Separação das Águas 2.0',
    'SuperSistema Neuronal',
    'Diagonais da Matriz',
    'Diagonais da Matriz 3D',
    'Pirâmide de Pascal',
    'Pirâmide de Intervalos',
    'Transições de Markov',
    'Geometria & Ciclos',
    'Harmonia Dimensional (Antigravity)',
    'Sistema Oscilação Universal V2',
    'Sistema Média +3 Otimizado',
    'Matriz de Corte',
    'Mais Sorteadas de Sempre',
    'Mais Quentes',
    'Últimos a Sair',
    'Random Forest AI',
    'Random Forest'
];

async function main() {
    console.log('================================================================');
    console.log('🚀 SINCRONIZAÇÃO LOCAL (SQLite) -> PRODUÇÃO VPS (PostgreSQL)');
    console.log('================================================================\n');

    const connString = process.env.POSTGRES_URL_PROD;
    if (!connString) {
        throw new Error('POSTGRES_URL_PROD não definida no .env');
    }

    const pg = new Client({
        connectionString: connString,
        connectionTimeoutMillis: 15000
    });

    await pg.connect();
    console.log('✅ Ligado ao PostgreSQL da VPS com sucesso!\n');

    try {
        // 1. Mapear todos os sorteios (Draw) entre SQLite e PostgreSQL por (game, YYYY-MM-DD)
        console.log('📅 1. A mapear sorteios entre Local e Produção...');
        const localDraws = await prisma.draw.findMany({
            orderBy: { date: 'asc' }
        });
        const prodDrawsRes = await pg.query('SELECT id, game, date, "sequenceNumber", numbers, stars FROM "Draw" ORDER BY date ASC');

        const prodDrawIdByGameDate = new Map<string, number>();
        const prodDrawIdByGameSeq = new Map<string, number>();
        const prodDrawIdByGameNums = new Map<string, number>();

        for (const row of prodDrawsRes.rows) {
            const iso = new Date(row.date).toISOString().slice(0, 10);
            prodDrawIdByGameDate.set(`${row.game}_${iso}`, row.id);
            if (row.sequenceNumber) {
                prodDrawIdByGameSeq.set(`${row.game}_${row.sequenceNumber}`, row.id);
            }
            const numStr = typeof row.numbers === 'object' ? JSON.stringify(row.numbers) : String(row.numbers);
            const starStr = typeof row.stars === 'object' ? JSON.stringify(row.stars) : String(row.stars);
            prodDrawIdByGameNums.set(`${row.game}_${numStr}_${starStr}`, row.id);
        }

        // Garantir que qualquer sorteio local que falte na VPS é inserido
        let insertedDraws = 0;
        const localToProdDrawId = new Map<number, number>();

        for (const ld of localDraws) {
            const iso = new Date(ld.date).toISOString().slice(0, 10);
            const keyDate = `${ld.game}_${iso}`;
            const keySeq = ld.sequenceNumber ? `${ld.game}_${ld.sequenceNumber}` : '';
            const keyNums = `${ld.game}_${ld.numbers}_${ld.stars}`;

            let prodId =
                prodDrawIdByGameDate.get(keyDate) ||
                (keySeq ? prodDrawIdByGameSeq.get(keySeq) : undefined) ||
                prodDrawIdByGameNums.get(keyNums);

            if (!prodId) {
                try {
                    const ins = await pg.query(
                        `INSERT INTO "Draw" (game, "sequenceNumber", date, numbers, stars, jackpot, "hasWinner", "numWinners", "starWinners", "createdAt", "updatedAt")
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
                         ON CONFLICT DO NOTHING
                         RETURNING id`,
                        [
                            ld.game,
                            ld.sequenceNumber,
                            ld.date,
                            ld.numbers,
                            ld.stars,
                            ld.jackpot,
                            ld.hasWinner ?? false,
                            ld.numWinners ?? 0,
                            ld.starWinners ?? 0
                        ]
                    );
                    if (ins.rows.length > 0) {
                        prodId = ins.rows[0].id;
                        prodDrawIdByGameDate.set(keyDate, prodId!);
                        insertedDraws++;
                    }
                } catch {}
            }
            if (prodId) {
                localToProdDrawId.set(ld.id, prodId);
            }
        }
        console.log(`   ✅ ${localToProdDrawId.size} sorteios mapeados (${insertedDraws} novos criados na VPS).`);

        // 2. Sincronizar RankedSystem
        console.log('\n⚙️ 2. A sincronizar RankedSystem...');
        const localSystems = await prisma.rankedSystem.findMany();
        for (const rs of localSystems) {
            await pg.query(
                `INSERT INTO ranked_systems (game, name, "isActive", description, concept, logic, explanation, "systemType", domain, dependencies, complexity, priority, "createdAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
                 ON CONFLICT (name, game) DO UPDATE SET
                    "isActive" = EXCLUDED."isActive",
                    description = COALESCE(EXCLUDED.description, ranked_systems.description),
                    "systemType" = EXCLUDED."systemType",
                    domain = EXCLUDED.domain`,
                [
                    rs.game,
                    rs.name,
                    rs.isActive,
                    rs.description,
                    rs.concept,
                    rs.logic,
                    rs.explanation,
                    rs.systemType,
                    rs.domain,
                    rs.dependencies,
                    rs.complexity,
                    rs.priority
                ]
            );
        }
        console.log(`   ✅ ${localSystems.length} registos RankedSystem sincronizados.`);

        // Remover duplicado legado 'Supersistema Neuronal' (com 's' minúsculo) na VPS se existir
        await pg.query(`DELETE FROM "SystemPrediction" WHERE "systemName" = 'Supersistema Neuronal'`);

        // 3. Sincronizar SystemPrediction para os sistemas recalculados + estrelas recentes
        console.log('\n🔮 3. A sincronizar SystemPrediction (Histórico Recalculado e Blindado)...');

        for (const sysName of SYSTEMS_TO_PUSH) {
            const localPreds = await prisma.systemPrediction.findMany({
                where: { systemName: sysName }
            });
            if (localPreds.length === 0) continue;

            // Apagar histórico antigo desse sistema na VPS e inserir em batches multi-row para velocidade máxima
            await pg.query(`DELETE FROM "SystemPrediction" WHERE "systemName" = $1 AND domain = 'NUMBERS'`, [sysName]);

            const validRows = [];
            for (const p of localPreds) {
                const prodDrawId = localToProdDrawId.get(p.drawId);
                if (!prodDrawId) continue;
                validRows.push({ ...p, prodDrawId });
            }

            const BATCH_SIZE = 400;
            for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
                const chunk = validRows.slice(i, i + BATCH_SIZE);
                const values: any[] = [];
                const placeholders: string[] = [];

                chunk.forEach((r, idx) => {
                    const base = idx * 24;
                    placeholders.push(
                        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14}, $${base + 15}, $${base + 16}, $${base + 17}, $${base + 18}, $${base + 19}, $${base + 20}, $${base + 21}, $${base + 22}, $${base + 23}, $${base + 24})`
                    );
                    values.push(
                        r.prodDrawId,
                        r.game,
                        r.domain,
                        r.systemName,
                        r.prediction,
                        r.cutoff,
                        r.num_hits_5 ?? 0,
                        r.num_hits_10 ?? 0,
                        r.num_hits_15 ?? 0,
                        r.num_hits_20 ?? 0,
                        r.num_hits_25 ?? 0,
                        r.num_hits_30 ?? 0,
                        r.num_hits_35 ?? 0,
                        r.num_hits_40 ?? 0,
                        r.num_hits_45 ?? 0,
                        r.num_hits_50 ?? 0,
                        r.num_hits_55 ?? 0,
                        r.num_hits_60 ?? 0,
                        r.star_hits_2,
                        r.star_hits_4,
                        r.star_hits_6,
                        r.star_hits_8,
                        r.star_hits_10,
                        r.star_hits_12
                    );
                });

                await pg.query(
                    `INSERT INTO "SystemPrediction" (
                        "drawId", game, domain, "systemName", prediction, cutoff,
                        num_hits_5, num_hits_10, num_hits_15, num_hits_20, num_hits_25, num_hits_30,
                        num_hits_35, num_hits_40, num_hits_45, num_hits_50, num_hits_55, num_hits_60,
                        star_hits_2, star_hits_4, star_hits_6, star_hits_8, star_hits_10, star_hits_12
                    ) VALUES ${placeholders.join(', ')}
                    ON CONFLICT ("drawId", "systemName", game, domain) DO UPDATE SET
                        prediction = EXCLUDED.prediction,
                        cutoff = EXCLUDED.cutoff,
                        num_hits_5 = EXCLUDED.num_hits_5,
                        num_hits_10 = EXCLUDED.num_hits_10,
                        num_hits_15 = EXCLUDED.num_hits_15,
                        num_hits_20 = EXCLUDED.num_hits_20,
                        num_hits_25 = EXCLUDED.num_hits_25,
                        num_hits_30 = EXCLUDED.num_hits_30,
                        num_hits_35 = EXCLUDED.num_hits_35,
                        num_hits_40 = EXCLUDED.num_hits_40,
                        num_hits_45 = EXCLUDED.num_hits_45,
                        num_hits_50 = EXCLUDED.num_hits_50,
                        num_hits_55 = EXCLUDED.num_hits_55,
                        num_hits_60 = EXCLUDED.num_hits_60`,
                    values
                );
            }
            console.log(`   ✅ ${sysName}: ${validRows.length} previsões sincronizadas.`);
        }

        // 4. Sincronizar também todas as previsões recentes (últimos 30 dias, incluindo STARS) para garantir paridade 100%
        console.log('\n⭐ 4. A sincronizar previsões recentes (todos os sistemas de Números e Estrelas dos últimos 30 dias)...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentDraws = localDraws.filter(d => new Date(d.date) >= thirtyDaysAgo);
        const recentDrawIds = recentDraws.map(d => d.id);

        const recentPreds = await prisma.systemPrediction.findMany({
            where: { drawId: { in: recentDrawIds } }
        });

        let recentSynced = 0;
        const RECENT_BATCH = 300;
        const validRecent = recentPreds
            .map(r => ({ ...r, prodDrawId: localToProdDrawId.get(r.drawId) }))
            .filter(r => !!r.prodDrawId);

        for (let i = 0; i < validRecent.length; i += RECENT_BATCH) {
            const chunk = validRecent.slice(i, i + RECENT_BATCH);
            const values: any[] = [];
            const placeholders: string[] = [];

            chunk.forEach((r, idx) => {
                const base = idx * 24;
                placeholders.push(
                    `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14}, $${base + 15}, $${base + 16}, $${base + 17}, $${base + 18}, $${base + 19}, $${base + 20}, $${base + 21}, $${base + 22}, $${base + 23}, $${base + 24})`
                );
                values.push(
                    r.prodDrawId,
                    r.game,
                    r.domain,
                    r.systemName,
                    r.prediction,
                    r.cutoff,
                    r.num_hits_5 ?? 0,
                    r.num_hits_10 ?? 0,
                    r.num_hits_15 ?? 0,
                    r.num_hits_20 ?? 0,
                    r.num_hits_25 ?? 0,
                    r.num_hits_30 ?? 0,
                    r.num_hits_35 ?? 0,
                    r.num_hits_40 ?? 0,
                    r.num_hits_45 ?? 0,
                    r.num_hits_50 ?? 0,
                    r.num_hits_55 ?? 0,
                    r.num_hits_60 ?? 0,
                    r.star_hits_2,
                    r.star_hits_4,
                    r.star_hits_6,
                    r.star_hits_8,
                    r.star_hits_10,
                    r.star_hits_12
                );
            });

            await pg.query(
                `INSERT INTO "SystemPrediction" (
                    "drawId", game, domain, "systemName", prediction, cutoff,
                    num_hits_5, num_hits_10, num_hits_15, num_hits_20, num_hits_25, num_hits_30,
                    num_hits_35, num_hits_40, num_hits_45, num_hits_50, num_hits_55, num_hits_60,
                    star_hits_2, star_hits_4, star_hits_6, star_hits_8, star_hits_10, star_hits_12
                ) VALUES ${placeholders.join(', ')}
                ON CONFLICT ("drawId", "systemName", game, domain) DO UPDATE SET
                    prediction = EXCLUDED.prediction,
                    cutoff = EXCLUDED.cutoff,
                    num_hits_5 = EXCLUDED.num_hits_5,
                    num_hits_10 = EXCLUDED.num_hits_10,
                    num_hits_15 = EXCLUDED.num_hits_15,
                    num_hits_20 = EXCLUDED.num_hits_20,
                    num_hits_25 = EXCLUDED.num_hits_25,
                    num_hits_30 = EXCLUDED.num_hits_30,
                    num_hits_35 = EXCLUDED.num_hits_35,
                    num_hits_40 = EXCLUDED.num_hits_40,
                    num_hits_45 = EXCLUDED.num_hits_45,
                    num_hits_50 = EXCLUDED.num_hits_50,
                    num_hits_55 = EXCLUDED.num_hits_55,
                    num_hits_60 = EXCLUDED.num_hits_60,
                    star_hits_2 = EXCLUDED.star_hits_2,
                    star_hits_4 = EXCLUDED.star_hits_4,
                    star_hits_6 = EXCLUDED.star_hits_6,
                    star_hits_8 = EXCLUDED.star_hits_8,
                    star_hits_10 = EXCLUDED.star_hits_10,
                    star_hits_12 = EXCLUDED.star_hits_12`,
                values
            );
            recentSynced += chunk.length;
        }
        console.log(`   ✅ ${recentSynced} previsões recentes sincronizadas.`);

        // 5. Sincronizar CachedPrediction (as 224 previsões seladas para o próximo sorteio)
        console.log('\n🔒 5. A sincronizar CachedPrediction (Previsões Seladas para o Próximo Sorteio)...');
        const localCached = await prisma.cachedPrediction.findMany();
        await pg.query('DELETE FROM cached_predictions');

        for (const cp of localCached) {
            await pg.query(
                `INSERT INTO cached_predictions (game, "systemName", numbers, "worstNumbers", "updatedAt")
                 VALUES ($1, $2, $3, $4, NOW())
                 ON CONFLICT ("systemName", game) DO UPDATE SET
                    numbers = EXCLUDED.numbers,
                    "worstNumbers" = EXCLUDED."worstNumbers",
                    "updatedAt" = NOW()`,
                [cp.game, cp.systemName, cp.numbers, cp.worstNumbers]
            );
        }
        console.log(`   ✅ ${localCached.length} previsões futuras seladas em cached_predictions na VPS.`);

        // 6. Sincronizar SystemRanking, StarSystemRanking e StatisticsCache
        console.log('\n📊 6. A sincronizar SystemRanking, StarSystemRanking e StatisticsCache...');
        const localRankings = await prisma.systemRanking.findMany();
        for (const r of localRankings) {
            await pg.query(
                `INSERT INTO system_ranking (game, "systemName", "avgAccuracy", "totalPredictions", "lastUpdated")
                 VALUES ($1, $2, $3, $4, NOW())
                 ON CONFLICT ("systemName", game) DO UPDATE SET
                    "avgAccuracy" = EXCLUDED."avgAccuracy",
                    "totalPredictions" = EXCLUDED."totalPredictions",
                    "lastUpdated" = NOW()`,
                [r.game, r.systemName, r.avgAccuracy, r.totalPredictions]
            );
        }

        const localStarRankings = await prisma.starSystemRanking.findMany();
        for (const sr of localStarRankings) {
            await pg.query(
                `INSERT INTO star_system_ranking (game, "systemName", "avgAccuracy", "totalPredictions", "totalHits", jackpots, "lastUpdated")
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())
                 ON CONFLICT ("systemName", game) DO UPDATE SET
                    "avgAccuracy" = EXCLUDED."avgAccuracy",
                    "totalPredictions" = EXCLUDED."totalPredictions",
                    "totalHits" = EXCLUDED."totalHits",
                    jackpots = EXCLUDED.jackpots,
                    "lastUpdated" = NOW()`,
                [sr.game, sr.systemName, sr.avgAccuracy, sr.totalPredictions, sr.totalHits, sr.jackpots]
            );
        }

        const localStatsCache = await prisma.statisticsCache.findMany();
        for (const sc of localStatsCache) {
            await pg.query(
                `INSERT INTO statistics_cache (key, data, "createdAt", "updatedAt")
                 VALUES ($1, $2, NOW(), NOW())
                 ON CONFLICT (key) DO UPDATE SET
                    data = EXCLUDED.data,
                    "updatedAt" = NOW()`,
                [sc.key, sc.data]
            );
        }
        console.log(`   ✅ ${localRankings.length} SystemRankings, ${localStarRankings.length} StarRankings e ${localStatsCache.length} StatisticsCache sincronizados.`);

        // Verificação Final na Produção: Totoloto 28/10/2026 - Separação das Águas
        const checkRes = await pg.query(`
            SELECT sp."systemName", sp.num_hits_25, d.date, d.numbers
            FROM "SystemPrediction" sp
            JOIN "Draw" d ON sp."drawId" = d.id
            WHERE sp.game = 'TOTOLOTO' AND sp."systemName" IN ('Separação das Águas', 'Diagonais da Matriz')
            ORDER BY d.date DESC LIMIT 2
        `);
        console.log('\n🔍 Verificação no PostgreSQL da Produção (Totoloto 28/10/2026):');
        for (const row of checkRes.rows) {
            console.log(`   👉 ${row.systemName}: ${row.num_hits_25}/5 acertos (${new Date(row.date).toISOString().slice(0, 10)})`);
        }

        console.log('\n🎉 SINCRONIZAÇÃO LOCAL -> PRODUÇÃO CONCLUÍDA COM 100% DE SUCESSO!');
    } finally {
        await pg.end();
        await prisma.$disconnect();
    }
}

main().catch(err => {
    console.error('❌ Erro na sincronização para a VPS:', err);
    process.exit(1);
});
