import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const game = searchParams.get("game") || "EUROMILLIONS";

        const predictions = await prisma.systemPrediction.findMany({
            where: { game },
            include: { draw: true },
            orderBy: [{ drawId: "desc" }, { systemName: "asc" }],
        });

        if (!predictions.length) {
            return NextResponse.json({ error: "Nenhuma previsão encontrada" }, { status: 404 });
        }

        // Define CSV Headers
        const headers = [
            "DrawID", "Date", "Game", "Domain", "SystemName", 
            "NumHits_5", "NumHits_10", "NumHits_15", "NumHits_20", "NumHits_25", "NumHits_30", "NumHits_35", "NumHits_40", "NumHits_45", "NumHits_50", 
            "StarHits_2", "StarHits_4", "StarHits_6", "StarHits_8", "StarHits_10", "StarHits_12"
        ];

        let csv = headers.join(",") + "\n";

        for (const p of predictions) {
            const row = [
                p.drawId,
                p.draw.date.toISOString().split("T")[0],
                p.game,
                p.domain,
                `"${p.systemName}"`,
                p.num_hits_5 ?? "",
                p.num_hits_10 ?? "",
                p.num_hits_15 ?? "",
                p.num_hits_20 ?? "",
                p.num_hits_25 ?? "",
                p.num_hits_30 ?? "",
                p.num_hits_35 ?? "",
                p.num_hits_40 ?? "",
                p.num_hits_45 ?? "",
                p.num_hits_50 ?? "",
                p.star_hits_2 ?? "",
                p.star_hits_4 ?? "",
                p.star_hits_6 ?? "",
                p.star_hits_8 ?? "",
                p.star_hits_10 ?? "",
                p.star_hits_12 ?? ""
            ];
            csv += row.join(",") + "\n";
        }

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="Exportacao_Previsoes_${game}.csv"`,
            },
        });
    } catch (error) {
        console.error("[Export Predictions Error]:", error);
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}

