import { Client } from 'pg';
import { prisma } from '@/lib/prisma';

export interface VpsSyncResult {
  success: boolean;
  message: string;
  drawsSynced: number;
  predictionsSynced: number;
  cachedPredictionsSynced: number;
  durationMs: number;
  details?: Record<string, any>;
  error?: string;
}

export async function syncFromVPS(daysLookback: number = 90): Promise<VpsSyncResult> {
  const startTime = Date.now();
  const connString = process.env.POSTGRES_URL_PROD;

  if (!connString) {
    return {
      success: false,
      message: 'POSTGRES_URL_PROD não configurada no ficheiro .env',
      drawsSynced: 0,
      predictionsSynced: 0,
      cachedPredictionsSynced: 0,
      durationMs: 0,
      error: 'Missing POSTGRES_URL_PROD'
    };
  }

  const pgClient = new Client({
    connectionString: connString,
    connectionTimeoutMillis: 10000
  });

  let drawsSynced = 0;
  let predictionsSynced = 0;
  let cachedPredictionsSynced = 0;

  try {
    await pgClient.connect();

    // Data de corte para sincronização (ex: últimos 90 dias)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLookback);
    const syncStartDateIso = startDate.toISOString().split('T')[0];

    // 1. Sincronizar Sorteios (Draw)
    const prodDrawsRes = await pgClient.query(
      'SELECT * FROM "Draw" WHERE date >= $1 ORDER BY date ASC;',
      [syncStartDateIso]
    );

    const localDrawMap = new Map<string, number>();

    for (const d of prodDrawsRes.rows) {
      const numStr = typeof d.numbers === 'object' ? JSON.stringify(d.numbers) : String(d.numbers);
      const starStr = typeof d.stars === 'object' ? JSON.stringify(d.stars) : String(d.stars);
      const dateKey = `${d.game}_${new Date(d.date).toISOString().slice(0, 10)}`;

      try {
        const existing = await prisma.draw.findFirst({
          where: {
            game: d.game,
            OR: [
              { date: new Date(d.date) },
              { numbers: numStr, stars: starStr }
            ]
          }
        });

        if (existing) {
          await prisma.draw.update({
            where: { id: existing.id },
            data: {
              date: new Date(d.date),
              sequenceNumber: d.sequenceNumber,
              numbers: numStr,
              stars: starStr,
              jackpot: d.jackpot ? Number(d.jackpot) : null,
              hasWinner: d.hasWinner ?? false,
              numWinners: d.numWinners ?? 0,
              starWinners: d.starWinners ?? 0
            }
          });
          localDrawMap.set(dateKey, existing.id);
        } else {
          const created = await prisma.draw.create({
            data: {
              game: d.game,
              date: new Date(d.date),
              sequenceNumber: d.sequenceNumber,
              numbers: numStr,
              stars: starStr,
              jackpot: d.jackpot ? Number(d.jackpot) : null,
              hasWinner: d.hasWinner ?? false,
              numWinners: d.numWinners ?? 0,
              starWinners: d.starWinners ?? 0
            }
          });
          localDrawMap.set(dateKey, created.id);
          drawsSynced++;
        }
      } catch (err: any) {
        console.warn(`[VPS Sync] Aviso no sorteio ${dateKey}:`, err.message);
      }
    }

    // Carregar todos os sorteios locais do período para complementar o mapa
    const localDraws = await prisma.draw.findMany({
      where: { date: { gte: startDate } },
      select: { id: true, game: true, date: true }
    });
    for (const ld of localDraws) {
      const key = `${ld.game}_${ld.date.toISOString().slice(0, 10)}`;
      if (!localDrawMap.has(key)) {
        localDrawMap.set(key, ld.id);
      }
    }

    // 2. Sincronizar RankedSystem (para evitar violações de chave estrangeira)
    const rankedSystemsRes = await pgClient.query('SELECT * FROM ranked_systems;');
    for (const rs of rankedSystemsRes.rows) {
      try {
        await prisma.rankedSystem.upsert({
          where: {
            name_game: {
              name: rs.name,
              game: rs.game
            }
          },
          update: {
            systemType: rs.systemType || 'BASE',
            domain: rs.domain || 'NUMBERS',
            priority: rs.priority || 50,
            complexity: rs.complexity || 1
          },
          create: {
            name: rs.name,
            game: rs.game,
            systemType: rs.systemType || 'BASE',
            domain: rs.domain || 'NUMBERS',
            priority: rs.priority || 50,
            complexity: rs.complexity || 1
          }
        });
      } catch (_) {}
    }

    // 3. Sincronizar SystemPredictions
    const predsRes = await pgClient.query(`
      SELECT sp.*, d.game as draw_game, d.date as draw_date
      FROM "SystemPrediction" sp
      JOIN "Draw" d ON sp."drawId" = d.id
      WHERE d.date >= $1;
    `, [syncStartDateIso]);

    for (const p of predsRes.rows) {
      const drawKey = `${p.draw_game}_${new Date(p.draw_date).toISOString().slice(0, 10)}`;
      const localDrawId = localDrawMap.get(drawKey);

      if (!localDrawId || p.game !== p.draw_game) continue;

      try {
        const predStr = typeof p.prediction === 'object' ? JSON.stringify(p.prediction) : String(p.prediction);

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
            prediction: predStr,
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
            calculatedAt: p.calculatedAt ? new Date(p.calculatedAt) : new Date()
          },
          create: {
            drawId: localDrawId,
            systemName: p.systemName,
            game: p.game,
            domain: p.domain,
            prediction: predStr,
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
            calculatedAt: p.calculatedAt ? new Date(p.calculatedAt) : new Date()
          }
        });
        predictionsSynced++;
      } catch (_) {}
    }

    // 4. Sincronizar CachedPrediction (Previsões do Próximo Sorteio para o Dashboard)
    try {
      const cachedRes = await pgClient.query('SELECT * FROM cached_predictions;');
      for (const cp of cachedRes.rows) {
        try {
          const numStr = typeof cp.numbers === 'object' ? JSON.stringify(cp.numbers) : String(cp.numbers);
          const worstStr = cp.worstNumbers ? (typeof cp.worstNumbers === 'object' ? JSON.stringify(cp.worstNumbers) : String(cp.worstNumbers)) : null;

          await prisma.cachedPrediction.upsert({
            where: {
              systemName_game: {
                systemName: cp.systemName,
                game: cp.game
              }
            },
            update: {
              numbers: numStr,
              worstNumbers: worstStr,
              updatedAt: new Date()
            },
            create: {
              systemName: cp.systemName,
              game: cp.game,
              numbers: numStr,
              worstNumbers: worstStr
            }
          });
          cachedPredictionsSynced++;
        } catch (_) {}
      }
    } catch (_) {}

    const durationMs = Date.now() - startTime;

    return {
      success: true,
      message: `Sincronização concluída com sucesso em ${(durationMs / 1000).toFixed(1)}s!`,
      drawsSynced,
      predictionsSynced,
      cachedPredictionsSynced,
      durationMs,
      details: {
        totalVpsDrawsProcessed: prodDrawsRes.rows.length,
        syncStartDate: syncStartDateIso
      }
    };
  } catch (error: any) {
    console.error('[VPS Sync Error]:', error);
    return {
      success: false,
      message: `Erro ao comunicar com a VPS: ${error.message || 'Desconhecido'}`,
      drawsSynced,
      predictionsSynced,
      cachedPredictionsSynced,
      durationMs: Date.now() - startTime,
      error: error.message
    };
  } finally {
    await pgClient.end().catch(() => {});
  }
}
