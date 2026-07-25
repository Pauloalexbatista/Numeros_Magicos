import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameFilter = searchParams.get('game');
    const prizeFilter = searchParams.get('prize'); // 'jackpot', 'jackpot_1', 'jackpot_2', or 'all'

    const whereClause: any = {
      NOT: {
        systemName: { contains: "Random" }
      }
    };

    if (gameFilter && gameFilter !== 'all') {
      whereClause.game = gameFilter;
    }

    whereClause.OR = [
      { game: { in: ['EUROMILLIONS', 'TOTOLOTO'] }, hits: { gte: 3 } },
      { game: { in: ['EURODREAMS', 'MEGASENA'] }, hits: { gte: 4 } }
    ];

    const performances = await prisma.systemPerformance.findMany({
      where: whereClause,
      include: {
        draw: true
      },
      orderBy: {
        draw: { date: 'desc' }
      }
    });

    let results = performances.map(perf => {
      const isSixHitsGame = perf.game === 'EURODREAMS' || perf.game === 'MEGASENA';
      const maxHits = isSixHitsGame ? 6 : 5;
      
      let prizeType = '';
      if (perf.hits === maxHits) prizeType = 'jackpot';
      else if (perf.hits === maxHits - 1) prizeType = 'jackpot_1';
      else if (perf.hits === maxHits - 2) prizeType = 'jackpot_2';

      return {
        id: perf.id,
        date: perf.draw.date,
        game: perf.game,
        systemName: perf.systemName,
        hits: perf.hits,
        prizeType: prizeType
      };
    }).filter(r => r.prizeType !== '');

    if (prizeFilter && prizeFilter !== 'all') {
      results = results.filter(r => r.prizeType === prizeFilter);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching jackpots tool data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
