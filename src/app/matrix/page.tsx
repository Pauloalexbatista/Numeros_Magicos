import { getHistory } from '@/app/actions';
import MatrixClient from '@/components/MatrixClient';

export default async function MatrixPage({ searchParams }: { searchParams: Promise<{ limit?: string }> }) {
    const history = await getHistory();
    const { limit: limitParam } = await searchParams;
    const limit = limitParam ? parseInt(limitParam) : 50; // Default to 50 rows to keep it fast initially

    // Process data
    const drawsToAnalyze = limit > 0 ? history.slice(0, limit) : history;

    const tableData = drawsToAnalyze.map(draw => ({
        date: draw.date.toISOString(),
        numbers: draw.numbers
    }));

    return <MatrixClient draws={tableData} limit={limit} />;
}
