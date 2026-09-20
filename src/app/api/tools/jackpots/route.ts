import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameFilter = searchParams.get("game");
    const prizeFilter = searchParams.get("prize"); // "jackpot", "jackpot_1", "jackpot_2", or "all"

    const whereClause: any = {
      domain: "NUMBERS"
    };

    if (gameFilter && gameFilter !== "all") {
      const game = gameFilter.toUpperCase();
      whereClause.game = game;
      if (game === "EURODREAMS") {
        whereClause.num_hits_20 = { gte: 4 };
      } else if (game === "MEGASENA") {
        whereClause.num_hits_30 = { gte: 4 };
      } else {
        whereClause.num_hits_25 = { gte: 3 };
      }
    } else {
      whereClause.OR = [
        { game: { in: ["EUROMILLIONS", "TOTOLOTO"] }, num_hits_25: { gte: 3 } },
        { game: "EURODREAMS", num_hits_20: { gte: 4 } },
        { game: "MEGASENA", num_hits_30: { gte: 4 } }
      ];
    }

    // Fetch predictions with draws directly filtered by hit threshold
    const predictions = await prisma.systemPrediction.findMany({
      where: whereClause,
      include: {
        draw: {
          select: { date: true, numbers: true }
        }
      },
      orderBy: {
        draw: { date: "desc" }
      }
    });

    const results: any[] = [];

    for (const perf of predictions) {
      if (!perf.draw) continue;

      const isSixHitsGame = perf.game === "EURODREAMS" || perf.game === "MEGASENA";
      const maxHits = isSixHitsGame ? 6 : 5;
      const hitCol = perf.game === "EURODREAMS" ? "num_hits_20" : perf.game === "MEGASENA" ? "num_hits_30" : "num_hits_25";
      const hits = (perf as any)[hitCol] ?? 0;

      let prizeType = "";
      if (hits === maxHits) {
        prizeType = "jackpot";
      } else if (hits === maxHits - 1) {
        prizeType = "jackpot_1";
      } else if (hits === maxHits - 2) {
        prizeType = "jackpot_2";
      }

      if (!prizeType) continue;
      if (prizeFilter && prizeFilter !== "all" && prizeType !== prizeFilter) continue;

      results.push({
        id: perf.id,
        date: perf.draw.date,
        game: perf.game,
        systemName: perf.systemName,
        hits,
        prizeType
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching tool jackpots:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
