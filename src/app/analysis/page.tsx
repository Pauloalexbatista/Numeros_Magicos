import { getHistory } from '../actions';
import AnalysisClient from '@/components/AnalysisClient';
import { auth } from '@/auth';

export default async function AnalysisPage({ searchParams }: { searchParams: Promise<{ limit?: string }> }) {
    // const session = await auth();
    // const userRole = (session?.user as any)?.role;
    const userRole = 'ADMIN'; // PERMANENT BYPASS
    const history = await getHistory();
    const { limit: limitParam } = await searchParams;

    // Determine number of draws to analyze (default 50)
    const limit = limitParam ? parseInt(limitParam) : 50;
    const drawsToAnalyze = limit > 0 ? history.slice(0, limit) : history;

    // Calculate frequency for numbers 1-50 based on selected draws
    const numberFrequency: { [key: number]: number } = {};
    for (let i = 1; i <= 50; i++) {
        numberFrequency[i] = 0;
    }

    drawsToAnalyze.forEach((draw) => {
        draw.numbers.forEach((num) => {
            numberFrequency[num]++;
        });
    });

    // Convert dates to strings for client component
    const serializedDraws = drawsToAnalyze.map(d => ({
        ...d,
        date: new Date(d.date).toISOString()
    }));

    // Determine max and min frequencies
    const sorted = Object.values(numberFrequency).sort((a, b) => b - a);
    const maxFreq = sorted[0];
    const minFreq = sorted[sorted.length - 1];

    return (
        <AnalysisClient
            numberFrequency={numberFrequency}
            limit={limit}
            maxFreq={maxFreq}
            minFreq={minFreq}
            userRole={userRole}
            draws={serializedDraws}
        />
    );
}
