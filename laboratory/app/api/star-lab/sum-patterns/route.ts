import { NextResponse } from 'next/server';
import { StarAnalysisService } from '@/lib/StarAnalysisService';

export async function GET() {
    try {
        const sumPatterns = await StarAnalysisService.analyzeSumPatterns(200);
        const data = Array.from(sumPatterns.entries());
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in sum patterns API:', error);
        return NextResponse.json({ error: 'Failed to load sum patterns' }, { status: 500 });
    }
}
