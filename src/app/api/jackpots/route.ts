import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get("game") || "euromillions";
    
    const gameEnum = {
      euromillions: "EUROMILLIONS",
      totoloto: "TOTOLOTO",
      eurodreams: "EURODREAMS",
      megasena: "MEGASENA",
      lotofacil: "LOTOFACIL"
    }[game.toLowerCase()] || "EUROMILLIONS";

    const isLotofacil = gameEnum === "LOTOFACIL";
    const isMegaSena = gameEnum === "MEGASENA";
    const isEuroDreams = gameEnum === "EURODREAMS";

    const hitColumn = (isEuroDreams || isLotofacil) ? "num_hits_20" : isMegaSena ? "num_hits_30" : "num_hits_25";
    const jackpotTarget = isLotofacil ? 15 : (isEuroDreams || isMegaSena) ? 6 : 5;
    const poolCut = isLotofacil ? 20 : isMegaSena ? 30 : isEuroDreams ? 20 : 25;

    const candidates = await prisma.systemPrediction.findMany({
      where: {
        game: gameEnum,
        domain: "NUMBERS",
        [hitColumn]: jackpotTarget,
        draw: {
          game: gameEnum
        },
        NOT: {
          systemName: { contains: "Random" }
        }
      },
      include: { draw: true },
      orderBy: { draw: { date: "desc" } },
      take: 20
    });

    const jackpots: any[] = [];
    for (const j of candidates) {
      if (!j.draw || !j.draw.numbers || !j.prediction) continue;
      if (j.draw.game !== gameEnum) continue;

      let actual: number[] = [];
      let pred: number[] = [];
      try {
        actual = typeof j.draw.numbers === "string" ? JSON.parse(j.draw.numbers) : j.draw.numbers;
        pred = typeof j.prediction === "string" ? JSON.parse(j.prediction) : j.prediction;
      } catch {
        continue;
      }

      const suggested = pred.slice(0, poolCut);
      const realHits = actual.filter(n => suggested.includes(n)).length;

      // Only present genuine jackpots where all numbers were hit in the suggested pool
      if (realHits === jackpotTarget) {
        jackpots.push({
          systemName: j.systemName,
          predictedNumbers: j.prediction,
          actualNumbers: j.draw.numbers,
          hits: jackpotTarget,
          draw: { date: j.draw.date }
        });
        if (jackpots.length >= 3) break;
      }
    }

    return NextResponse.json(jackpots);
  } catch (error) {
    console.error("Error fetching jackpots:", error);
    return NextResponse.json([], { status: 500 });
  }
}
