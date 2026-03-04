import { NextResponse } from 'next/server';
import { backfillRankings } from '@/services/ranking';

/**
 * Professional Maintenance API for Deep Historical Backfill
 * Allows triggering massive recalculations on the server CPU
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { secret, limit = 4000, exclusive } = body;

        // Security check using internal secret
        if (!secret || secret !== process.env.NEXTAUTH_SECRET) {
            console.warn('Unauthorized backfill attempt detected');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(`🚀 TRIGGERING SERVER-SIDE BACKFILL: Limit=${limit}, Exclusive=${exclusive || 'none'}`);

        backfillRankings(limit, exclusive as any)
            .then(() => {
                console.log('✅ SERVER-SIDE BACKFILL COMPLETED SUCCESSFULLY');
            })
            .catch((err) => {
                console.error('❌ SERVER-SIDE BACKFILL FAILED:', err);
            });

        return NextResponse.json({
            message: 'Historical backfill initiated on server.',
            gameLimit: limit,
            exclusive,
            status: 'processing'
        });

    } catch (error) {
        console.error('Backfill API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
