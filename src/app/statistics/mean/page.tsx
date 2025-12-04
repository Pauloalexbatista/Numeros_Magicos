import { getHistory } from '@/app/actions';
import { calculateMean, calculateAmplitude, classifyAmplitude } from '@/services/statistics';
import MeanAmplitudeClient from '@/components/MeanAmplitudeClient';

export default async function MeanPage({ searchParams }: { searchParams: Promise<{ limit?: string }> }) {
    const history = await getHistory();
    const { limit: limitParam } = await searchParams;
    const limit = limitParam ? parseInt(limitParam) : 50;

    // Process data
    const drawsToAnalyze = limit > 0 ? history.slice(0, limit) : history;

    // We need to reverse to show oldest -> newest in charts
    const chartData = [...drawsToAnalyze].reverse().map(draw => {
        const { meanNumbers } = calculateMean([draw]);
        const amplitude = calculateAmplitude(draw.numbers);

        return {
            date: draw.date.toISOString(),
            numbers: draw.numbers,
            stars: draw.stars,
            mean: meanNumbers,
            amplitude,
            ampClass: classifyAmplitude(amplitude)
        };
    });

    return <MeanAmplitudeClient draws={chartData} limit={limit} />;
}
