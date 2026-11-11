import { NextResponse } from "next/server";
import { calculateRadarData, SystemRadarStats } from "@/services/radarService";

export const dynamic = "force-dynamic";

export type { SystemRadarStats };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameParam = searchParams.get("game")?.toUpperCase() || "EUROMILLIONS";
    const domainParam = (searchParams.get("domain") || "NUMBERS").toUpperCase();
    const isStars = domainParam === "STARS";

    const result = await calculateRadarData(gameParam, isStars);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/tools/radar:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
