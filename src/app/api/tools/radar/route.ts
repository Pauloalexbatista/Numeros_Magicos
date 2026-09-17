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
  ultimos_a_sair: "Últimos a Sair"
};

const BASELINES: Record<string, { pool: number; maxHits: number; mean: number; prob: string }> = {
  EUROMILLIONS: { pool: 25, maxHits: 5, mean: 39.9, prob: "2.51%" },
  TOTOLOTO: { pool: 25, maxHits: 5, mean: 35.9, prob: "2.78%" },
  EURODREAMS: { pool: 20, maxHits: 6, mean: 70.3, prob: "1.42%" },
  MEGASENA: { pool: 30, maxHits: 6, mean: 84.1, prob: "1.19%" }
};

function formatSystemName(slug: string): string {
  if (SYSTEM_DISPLAY_NAMES[slug]) return SYSTEM_DISPLAY_NAMES[slug];
  return slug
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameParam = searchParams.get("game")?.toUpperCase() || "EUROMILLIONS";
    const game = ["EUROMILLIONS", "TOTOLOTO", "EURODREAMS", "MEGASENA"].includes(gameParam)
      ? gameParam
      : "EUROMILLIONS";

    const baseline = BASELINES[game] || BASELINES.EUROMILLIONS;

    const consolidatedDir = path.join(process.cwd(), "data", "consolidated");
    const gameSlug = game.toLowerCase();

    let drawsList: Array<{ id: number; date: string; numbers: number[] }> = [];
    const drawsExportPath = path.join(process.cwd(), "src", "data", "static", "draws-export.json");

    if (fs.existsSync(drawsExportPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(drawsExportPath, "utf-8"));
        drawsList = raw
          .map((d: any, idx: number) => ({
            id: idx + 1,
            date: d.date?.slice(0, 10) || "",
            numbers: typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers || []
          }))
          .sort((a: any, b: any) => a.id - b.id);
      } catch (err) {
        console.error("Error reading draws export:", err);
      }
    }

    const drawMap = new Map<number, { date: string; numbers: Set<number> }>();
    drawsList.forEach(d => {
      drawMap.set(d.id, { date: d.date, numbers: new Set(d.numbers) });
    });

    const totalDraws = drawsList.length || 1902;
    const systemsStats: SystemRadarStats[] = [];

    if (fs.existsSync(consolidatedDir)) {
      const files = fs.readdirSync(consolidatedDir).filter(
        f => f.endsWith(`_${gameSlug}.json`) && !f.includes("_stars_")
      );

      for (const f of files) {
        const slug = f.replace(`_${gameSlug}.json`, "");
        const filePath = path.join(consolidatedDir, f);

        try {
          const fileContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          if (!Array.isArray(fileContent)) continue;

          const hits5: number[] = [];
          const hits4: number[] = [];
          const hitColName = game === "EURODREAMS" ? "num_hits_20" : game === "MEGASENA" ? "num_hits_30" : "num_hits_25";
          const maxHits = baseline.maxHits;
          const traveHits = maxHits - 1;

          for (const item of fileContent) {
            if (!item || typeof item !== "object" || !item.drawId) continue;
            const dId = item.drawId;

            if (item[hitColName] !== undefined) {
              const h = item[hitColName];
              if (h === maxHits) hits5.push(dId);
              else if (h === traveHits) hits4.push(dId);
            } else if (drawMap.has(dId) && item.prediction) {
              let pred = item.prediction;
              if (typeof pred === "string") pred = JSON.parse(pred);
              if (Array.isArray(pred)) {
                const actual = drawMap.get(dId)!.numbers;
                const pool = new Set(pred.slice(0, baseline.pool));
                let count = 0;
                for (const n of actual) {
                  if (pool.has(n)) count++;
                }
                if (count === maxHits) hits5.push(dId);
                else if (count === traveHits) hits4.push(dId);
              }
            }
          }

          hits5.sort((a, b) => a - b);
          hits4.sort((a, b) => a - b);

          if (hits5.length === 0 && hits4.length === 0) continue;

          const intervals: number[] = [];
          for (let i = 1; i < hits5.length; i++) {
            intervals.push(hits5[i] - hits5[i - 1]);
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

          const lastJackpotDraw = hits5.length > 0 ? hits5[hits5.length - 1] : 0;
          const currentDelay = totalDraws - lastJackpotDraw;
          const lastJackpotDate = drawMap.get(lastJackpotDraw)?.date || null;

          const recent5Threshold = totalDraws - 5;
          const recent10Threshold = totalDraws - 10;
          const travesLast5 = hits4.filter(d => d > recent5Threshold).length;
          const travesLast10 = hits4.filter(d => d > recent10Threshold).length;

          // 1. Score de Ciclo (40%)
          let sCiclo = 50;
          const ratio = currentDelay / (mean || 1);
          if (ratio < 0.25) {
            sCiclo = 20;
          } else if (ratio < 0.75) {
            sCiclo = Math.round(50 + (ratio - 0.25) * 60);
          } else if (ratio <= 1.25) {
            sCiclo = 100;
          } else {
            sCiclo = Math.max(15, Math.round(100 - (ratio - 1.25) * 70));
          }

          // 2. Score de Convergencia (40%)
          let sConv = 15;
          if (travesLast5 >= 2) sConv = 100;
          else if (travesLast5 === 1) sConv = 80;
          else if (travesLast10 >= 2) sConv = 60;
          else if (travesLast10 === 1) sConv = 40;

          // 3. Score de Resiliencia (20%)
          const cv = mean > 0 ? stdDev / mean : 1;
          let sResil = Math.max(20, Math.min(100, Math.round((1.5 - cv) * 80)));

          const jpiScore = Math.round(0.40 * sCiclo + 0.40 * sConv + 0.20 * sResil);

          // Classificacao do estado da fruta
          let status: "ripe" | "warming" | "green" | "overdue" = "warming";
          let statusLabel = "Em Aquecimento";

          if (jpiScore >= 75 || (ratio >= 0.75 && ratio <= 1.25 && travesLast10 >= 1)) {
            status = "ripe";
            statusLabel = "Madura (No Ponto)";
          } else if (ratio < 0.35 && travesLast5 === 0) {
            status = "green";
            statusLabel = "Verde (Ressaca)";
          } else if (ratio > 1.6 && travesLast5 === 0) {
            status = "overdue";
            statusLabel = "Passada (Seca)";
          } else {
            status = "warming";
            statusLabel = "Em Aquecimento";
          }

          const timelineEvents: SystemRadarStats["timelineEvents"] = [];
          hits5.forEach((d, idx) => {
            timelineEvents.push({
              drawId: d,
              date: drawMap.get(d)?.date || "",
              type: "jackpot",
              interval: idx > 0 ? d - hits5[idx - 1] : d
            });
          });

          const recentTraves = hits4.slice(-60);
          recentTraves.forEach(d => {
            timelineEvents.push({
              drawId: d,
              date: drawMap.get(d)?.date || "",
              type: "trave"
            });
          });

          systemsStats.push({
            systemId: slug,
            systemName: formatSystemName(slug),
            totalJackpots: hits5.length,
            totalTraves: hits4.length,
            cycleMean: Math.round(mean * 10) / 10,
            cycleMedian: Math.round(median * 10) / 10,
            cycleStdDev: Math.round(stdDev * 10) / 10,
            currentDelay,
            lastJackpotDate,
            lastJackpotDrawId: lastJackpotDraw,
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
    }

    systemsStats.sort((a, b) => b.jpiScore - a.jpiScore);

    return NextResponse.json({
      game,
      totalDraws,
      baseline,
      systems: systemsStats
    });
  } catch (error) {
    console.error("Error in /api/tools/radar:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
