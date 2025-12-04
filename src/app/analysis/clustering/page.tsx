
import { getHistory } from '@/app/actions';
import ClusteringClient from '@/components/ClusteringClient';
import { BackButton } from '@/components/ui';

export default async function ClusteringPage() {
    const history = await getHistory();

    // Serialize dates
    const serializedHistory = history.map(d => ({
        ...d,
        date: d.date.toISOString(),
        numbers: d.numbers,
        stars: d.stars,
    }));

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <ClusteringClient history={serializedHistory} />
                </div>
            </div>
        </div>
    );
}
