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
      megasena: "MEGASENA"
    }[game.toLowerCase()] || "EUROMILLIONS";

    const hitColumn = (gameEnum === "EURODREAMS") ? "num_hits_20" : (gameEnum === "MEGASENA") ? "num_hits_30" : "num_hits_25";
    const jackpotTarget = (gameEnum === "EURODREAMS" || gameEnum === "MEGASENA") ? 6 : 5;

    const rawJackpots = await prisma.systemPrediction.findMany({
      where: {
        game: gameEnum,
        domain: "NUMBERS",
        [hitColumn]: jackpotTarget,
        NOT: {
          systemName: { contains: "Random" }
        }
      },
      include: { draw: true },
      orderBy: { draw: { date: "desc" } },
      take: 3
    });

    const jackpots = rawJackpots.map(j => ({
      systemName: j.systemName,
      predictedNumbers: j.prediction,
      actualNumbers: j.draw ? j.draw.numbers : "[]",
      hits: jackpotTarget,
      draw: { date: j.draw ? j.draw.date : new Date() }
    }));

    return NextResponse.json(jackpots);
  } catch (error) {
    console.error("Error fetching jackpots:", error);
    return NextResponse.json([], { status: 500 });
  }
}
