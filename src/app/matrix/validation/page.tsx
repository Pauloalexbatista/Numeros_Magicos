import { getHistory } from '@/app/actions';
import PyramidValidationClient from '@/components/PyramidValidationClient';
import { analyzePyramidAccuracy, getPyramidRecommendations } from '@/services/statistics';

export const dynamic = 'force-dynamic';

export default async function PyramidValidationPage() {
    const history = await getHistory();

    // Prepare draws for analysis
    const draws = history.map(draw => ({
        date: draw.date,
        numbers: draw.numbers,
        stars: draw.stars,
    }));

    // Analyze accuracy
    const accuracyStats = analyzePyramidAccuracy(draws);

    // Get recommendations for next draw
    const recommendations = getPyramidRecommendations(draws, 20);

    return (
        <PyramidValidationClient
            accuracyStats={accuracyStats}
            recommendations={recommendations}
            totalDraws={draws.length}
        />
    );
}
