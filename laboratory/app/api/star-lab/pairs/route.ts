import { NextResponse } from 'next/server';
import { StarAnalysisService } from '@/lib/StarAnalysisService';

export async function GET() {
    try {
        const pairs = await StarAnalysisService.analyzePairCorrelations(100);
        return NextResponse.json(pairs);
    } catch (error) {
        console.error('Error in pairs API:', error);
        return NextResponse.json({ error: 'Failed to load pair analysis' }, { status: 500 });
    }
}
