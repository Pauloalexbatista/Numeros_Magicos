
import { BackButton } from '@/components/ui';

export default async function ModelComparisonPage() {
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
                    <div className="flex items-center gap-4 mb-8">
                        <BackButton href="/model-lab" />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>📊</span> Comparação de Modelos
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Teste múltiplos modelos simultaneamente e descubra qual tem melhor performance histórica.
                            </p>
                        </div>
                    </div>

                    <ModelComparisonClient history={serializedHistory} />
                </div>
            </div>
        </div>
    );
}
