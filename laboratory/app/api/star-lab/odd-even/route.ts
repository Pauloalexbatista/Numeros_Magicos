import { NextResponse } from 'next/server';
import { StarAnalysisService } from '@/lib/StarAnalysisService';

export async function GET() {
    try {
        const oddEven = await StarAnalysisService.analyzeOddEvenPatterns(200);
        return NextResponse.json(oddEven);
    } catch (error) {
        console.error('Error in odd/even API:', error);
        return NextResponse.json({ error: 'Failed to load odd/even patterns' }, { status: 500 });
    }
}
