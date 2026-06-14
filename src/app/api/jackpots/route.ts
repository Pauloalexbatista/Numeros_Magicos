import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get('game') || 'euromillions';
    
    const gameEnum = {
      euromillions: 'EUROMILLIONS',
      totoloto: 'TOTOLOTO',
      eurodreams: 'EURODREAMS',
      megasena: 'MEGASENA'
    }[game.toLowerCase()] || 'EUROMILLIONS';

    const jackpotHits = (gameEnum === 'EURODREAMS' || gameEnum === 'MEGASENA') ? 6 : 5;

    const jackpots = await prisma.systemPerformance.findMany({
      where: {
        game: gameEnum,
        hits: { gte: jackpotHits },
        NOT: {
          systemName: { contains: "Random" }
        }
      },
      include: {
        draw: true
      },
      orderBy: {
        draw: { date: 'desc' }
      },
      take: 3
    });

    return NextResponse.json(jackpots);
  } catch (error) {
    console.error('Error fetching jackpots:', error);
    return NextResponse.json([], { status: 500 });
  }
}
