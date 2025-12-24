import { NextResponse } from 'next/server';
import { StarAnalysisService } from '../../../../lib/StarAnalysisService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const star = parseInt(searchParams.get('star') || '1');

        if (star < 1 || star > 12) {
            return NextResponse.json({ error: 'Invalid star number' }, { status: 400 });
        }

        const gaps = await StarAnalysisService.analyzeGapPatterns(star, 300);
        return NextResponse.json(gaps);
    } catch (error) {
        console.error('Error in gaps API:', error);
        return NextResponse.json({ error: 'Failed to load gap analysis' }, { status: 500 });
    }
}
