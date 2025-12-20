import { NextResponse } from 'next/server';
import { RegimeService } from '../../../lib/RegimeService';
import { VetoService } from '../../../lib/VetoService';
import { prisma } from '../../../lib/prisma';

export async function GET() {
    const regime = await RegimeService.analyzeRegime();
    const lastDraw = await prisma.draw.findFirst({ orderBy: { id: 'desc' } });
    const nextDrawId = (lastDraw?.id || 0) + 1;
    const allPredictions = await prisma.cachedPrediction.findMany();
    const counts = new Map<number, number>();
    allPredictions.forEach(p => {
        const nums = JSON.parse(p.numbers);
        nums.forEach((n: number) => counts.set(n, (counts.get(n) || 0) + 1));
    });
    const candidates = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([n]) => n);
    const veto = await VetoService.applyIntelligenceVeto(candidates, regime);
    return NextResponse.json({ success: true, regime, consensus: { candidates }, veto });
}
