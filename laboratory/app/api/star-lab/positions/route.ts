import { NextResponse } from 'next/server';
import { StarAnalysisService } from '@/lib/StarAnalysisService';

export async function GET() {
    try {
        const positions = await StarAnalysisService.analyzePositionalPreference(200);
        return NextResponse.json(positions);
    } catch (error) {
        console.error('Error in positions API:', error);
        return NextResponse.json({ error: 'Failed to load position analysis' }, { status: 500 });
    }
}
