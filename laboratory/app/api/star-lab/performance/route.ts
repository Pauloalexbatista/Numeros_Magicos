import { NextResponse } from 'next/server';
import { StarAnalysisService } from '../../../../lib/StarAnalysisService';

export async function GET() {
    try {
        const performance = await StarAnalysisService.getSystemPerformance();
        return NextResponse.json(performance);
    } catch (error) {
        console.error('Error in performance API:', error);
        return NextResponse.json({ error: 'Failed to load performance data' }, { status: 500 });
    }
}
