import { NextResponse } from 'next/server';
import { HistoryService } from '../../../lib/HistoryService';

export async function GET() {
    try {
        const yearly = await HistoryService.getYearlyTimeline();
        const monthly = await HistoryService.getRecentMonthlyTimeline();

        return NextResponse.json({ yearly, monthly });
    } catch (error) {
        console.error('History API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
