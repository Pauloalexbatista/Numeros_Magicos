import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

export interface SystemRadarStats {
  systemId: string;
  systemName: string;
  totalJackpots: number;
  totalTraves: number;
  cycleMean: number;
  cycleMedian: number;
  cycleStdDev: number;
  currentDelay: number;
  lastJackpotDate: string | null;
  lastJackpotDrawId: number | null;
  travesLast5: number;
  travesLast10: number;
  jpiScore: number;
  status: "ripe" | "warming" | "green" | "overdue";
  statusLabel: string;
  timelineEvents: Array<{
    drawId: number;
    date: string;
    type: "jackpot" | "trave";
    interval?: number;
  }>;
}

const SYSTEM_DISPLAY_NAMES: Record<string, string> = {
  tiro_certeiro: "Tiro Certeiro",
  separacao_aguas: "Separação das Águas",
  supersistema_neuronal: "Supersistema Neuronal",
  random_forest: "Random Forest",
  oscilacao_universal: "Oscilação Universal",
  markov: "Cadeia de Markov",
  clustering: "Agrupamento (Clustering)",
  diagonais_matriz: "Diagonais da Matriz 2D",
  diagonais_matriz_3d: "Diagonais da Matriz 3D",
  mais_quentes: "Mais Quentes (Hot)",
  mais_sorteadas_sempre: "Mais Sorteadas de Sempre",
  media_3_otimizado: "Média 3 Otimizado",
  monte_carlo: "Simulação Monte Carlo",
  piramide_intervalos: "Pirâmide de Intervalos",
  piramide_pascal: "Pirâmide de Pascal",
  ultimos_a_sair: "Últimos a Sair",
  matriz_corte: "Matriz de Corte (Via Negativa)"
};

const BASELINES: Record<string, { pool: number; maxHits: number; mean: number; prob: string }> = {
  EUROMILLIONS: { pool: 25, maxHits: 5, mean: 39.9, prob: "2.51%" },
  TOTOLOTO: { pool: 25, maxHits: 5, mean: 35.9, prob: "2.78%" },
  EURODREAMS: { pool: 20, maxHits: 6, mean: 70.3, prob: "1.42%" },
  MEGASENA: { pool: 30, maxHits: 6, mean: 84.1, prob: "1.19%" }
};

const BASELINES_STARS: Record<string, { pool: number; maxHits: number; mean: number; prob: string }> = {
  EUROMILLIONS: { pool: 6, maxHits: 2, mean: 4.0, prob: "25.0%" },
  TOTOLOTO: { pool: 6, maxHits: 1, mean: 2.2, prob: "46.1%" },
  EURODREAMS: { pool: 3, maxHits: 1, mean: 1.7, prob: "60.0%" },
  MEGASENA: { pool: 0, maxHits: 0, mean: 0, prob: "0%" }
};

function formatSystemName(slug: string, isStars: boolean = false): string {
  const baseName = SYSTEM_DISPLAY_NAMES[slug] || slug
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return isStars ? `${baseName} (Estrelas)` : baseName;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameParam = searchParams.get("game")?.toUpperCase() || "EUROMILLIONS";
    const game = ["EUROMILLIONS", "TOTOLOTO", "EURODREAMS", "MEGASENA"].includes(gameParam)
      ? gameParam
      : "EUROMILLIONS";

    const domainParam = (searchParams.get("domain") || "NUMBERS").toUpperCase();
    const isStars = domainParam === "STARS";

    if (isStars && game === "MEGASENA") {
      return NextResponse.json({
        game,
        totalDraws: 0,
        baseline: { pool: 0, maxHits: 0, mean: 0, prob: "0%" },
        systems: []
      });
    }

    const baseline = isStars
      ? (BASELINES_STARS[game] || BASELINES_STARS.EUROMILLIONS)
      : (BASELINES[game] || BASELINES.EUROMILLIONS);

    const consolidatedDir = path.join(process.cwd(), "data", "consolidated");
    const gameSlug = game.toLowerCase();

    const files = fs.existsSync(consolidatedDir)
      ? fs.readdirSync(consolidatedDir).filter(f =>
          isStars
            ? f.endsWith(`_stars_${gameSlug}.json`)
            : f.endsWith(`_${gameSlug}.json`) && !f.includes("_stars_")
        )
      : [];

    // Extrair os sorteios oficiais
    const officialDraws: Array<{ date: string; targets: Set<number> }> = [];

    for (const f of files) {
      const filePath = path.join(consolidatedDir, f);
      try {
        const fileContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (Array.isArray(fileContent)) {
          const sample = fileContent.find(x => {
            if (!x || typeof x !== "object") return false;
            if (isStars) {
              return (x.draw && x.draw.stars) || x.stars;
            }
            return (x.draw && x.draw.numbers) || x.numbers;
          });

          if (sample) {
            for (const x of fileContent) {
              if (x && typeof x === "object") {
                const rawDate = (x.draw?.date || x.date || "").slice(0, 10);
                let rawNums = isStars ? (x.draw?.stars || x.stars) : (x.draw?.numbers || x.numbers);
                if (typeof rawNums === "string") {
                  try { rawNums = JSON.parse(rawNums); } catch { rawNums = []; }
                }
                if (Array.isArray(rawNums) && rawNums.length > 0) {
                  officialDraws.push({
                    date: rawDate,
                    targets: new Set(rawNums)
                  });
                }
              }
            }
            break;
          }
        }
      } catch (err) {
        // continue
      }
    }

    const totalDraws = officialDraws.length > 0
      ? officialDraws.length
      : (game === "EURODREAMS" ? 299 : game === "TOTOLOTO" ? 1556 : game === "MEGASENA" ? 3048 : 1981);

    const systemsStats: SystemRadarStats[] = [];

    for (const f of files) {
      const slug = isStars
        ? f.replace(`_stars_${gameSlug}.json`, "")
        : f.replace(`_${gameSlug}.json`, "");
      const filePath = path.join(consolidatedDir, f);

      try {
        const fileContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (!Array.isArray(fileContent)) continue;

        const hits5: Array<{ seq: number; date: string }> = [];
        const hits4: Array<{ seq: number; date: string }> = [];
        const hitColName = isStars
          ? (game === "EUROMILLIONS" ? "star_hits_6" : "star_hits_2")
          : (game === "EURODREAMS" ? "num_hits_20" : game === "MEGASENA" ? "num_hits_30" : "num_hits_25");

        const maxHits = baseline.maxHits;
        const traveHits = Math.max(1, maxHits - 1);

        const limit = Math.min(totalDraws, fileContent.length);

        for (let i = 0; i < limit; i++) {
          const item = fileContent[i];
          if (!item || typeof item !== "object") continue;

          const seq = i + 1;
          const drawDate = officialDraws[i]?.date || (item.date || item.draw?.date || "").slice(0, 10);
          let hitCount = 0;

          if (item[hitColName] !== undefined && typeof item[hitColName] === "number") {
            hitCount = item[hitColName];
          } else if (item.prediction && officialDraws[i]) {
            let pred = item.prediction;
            if (typeof pred === "string") {
              try { pred = JSON.parse(pred); } catch (e) { pred = []; }
            }
            if (Array.isArray(pred)) {
              const pool = new Set(pred.slice(0, baseline.pool));
              for (const n of officialDraws[i].targets) {
                if (pool.has(n)) hitCount++;
              }
            }
          }

          if (hitCount === maxHits) {
            hits5.push({ seq, date: drawDate });
          } else if (hitCount === traveHits && maxHits > 1) {
            hits4.push({ seq, date: drawDate });
          }
        }

        if (hits5.length === 0 && hits4.length === 0) continue;

        const intervals: number[] = [];
        for (let i = 1; i < hits5.length; i++) {
          intervals.push(hits5[i].seq - hits5[i - 1].seq);
        }

        const mean = intervals.length > 0
          ? intervals.reduce((a, b) => a + b, 0) / intervals.length
          : baseline.mean;

        const sortedIntervals = [...intervals].sort((a, b) => a - b);
        const median = sortedIntervals.length > 0
          ? sortedIntervals[Math.floor(sortedIntervals.length / 2)]
          : mean;

        const variance = intervals.length > 1
          ? intervals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (intervals.length - 1)
          : 100;
        const stdDev = Math.sqrt(variance);

        const lastJackpotSeq = hits5.length > 0 ? hits5[hits5.length - 1].seq : 0;
        const currentDelay = totalDraws - lastJackpotSeq;
        const lastJackpotDate = hits5.length > 0 ? hits5[hits5.length - 1].date : null;

        const minSeq5 = Math.max(1, totalDraws - 4);
        const minSeq10 = Math.max(1, totalDraws - 9);
        const travesLast5 = hits4.filter(h => h.seq >= minSeq5).length;
        const travesLast10 = hits4.filter(h => h.seq >= minSeq10).length;

        // 1. Fator Ciclo (60% do JPI - Janela Natural de Maturação)
        const ratio = currentDelay / (mean || 1);
        let sCiclo = 30;
        if (ratio < 0.25) {
          sCiclo = 20;
        } else if (ratio < 0.50) {
          sCiclo = Math.round(20 + ((ratio - 0.25) / 0.25) * 40); // 20 -> 60
        } else if (ratio <= 1.50) {
          sCiclo = 100; // Sweet Spot: Janela natural de maturação
        } else {
          sCiclo = Math.max(20, Math.round(100 - (ratio - 1.50) * 50));
        }

        // 2. Pressão Térmica (40% do JPI - Confirmação de Convergência / Bolas na Trave)
        let sConv = 20;
        if (travesLast5 >= 2) sConv = 100;
        else if (travesLast5 === 1) sConv = 85;
        else if (travesLast10 >= 2) sConv = 75;
        else if (travesLast10 === 1) sConv = 60;
        else sConv = 20;

        // JPI = 60% Fator Ciclo + 40% Pressão Térmica
        const jpiScore = Math.min(100, Math.max(0, Math.round(0.60 * sCiclo + 0.40 * sConv)));

        let status: "ripe" | "warming" | "green" | "overdue" = "warming";
        let statusLabel = "Em Aquecimento";

        if (ratio < 0.25 && travesLast5 === 0) {
          status = "green";
          statusLabel = "Verde (Ressaca)";
        } else if (ratio > 1.80 && travesLast10 === 0) {
          status = "overdue";
          statusLabel = "Passada (Seca)";
        } else if (jpiScore >= 65 || (sCiclo === 100 && (travesLast10 >= 1 || maxHits === 1))) {
          status = "ripe";
          statusLabel = "Madura (No Ponto)";
        } else {
          status = "warming";
          statusLabel = "Em Aquecimento";
        }

        const timelineEvents: SystemRadarStats["timelineEvents"] = [];
        hits5.forEach((h, idx) => {
          timelineEvents.push({
            drawId: h.seq,
            date: h.date,
            type: "jackpot",
            interval: idx > 0 ? h.seq - hits5[idx - 1].seq : h.seq
          });
        });

        const recentTraves = hits4.slice(-60);
        recentTraves.forEach(h => {
          timelineEvents.push({
            drawId: h.seq,
            date: h.date,
            type: "trave"
          });
        });

        systemsStats.push({
          systemId: slug,
          systemName: formatSystemName(slug, isStars),
          totalJackpots: hits5.length,
          totalTraves: hits4.length,
          cycleMean: Math.round(mean * 10) / 10,
          cycleMedian: Math.round(median * 10) / 10,
          cycleStdDev: Math.round(stdDev * 10) / 10,
          currentDelay,
          lastJackpotDate,
          lastJackpotDrawId: lastJackpotSeq,
          travesLast5,
          travesLast10,
          jpiScore,
          status,
          statusLabel,
          timelineEvents: timelineEvents.sort((a, b) => a.drawId - b.drawId)
        });
      } catch (err) {
        console.error(`Error processing system ${slug}:`, err);
      }
    }

    systemsStats.sort((a, b) => b.jpiScore - a.jpiScore);

    return NextResponse.json({
      game,
      domain: domainParam,
      totalDraws,
      baseline,
      systems: systemsStats
    });
  } catch (error) {
    console.error("Error in /api/tools/radar:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
