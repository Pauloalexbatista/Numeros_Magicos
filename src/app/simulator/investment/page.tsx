
import { getHistory } from '@/app/actions';
import InvestmentSimulatorClient from '@/components/InvestmentSimulatorClient';
import { BackButton } from '@/components/ui';

export default async function InvestmentSimulatorPage() {
    const history = await getHistory();

    // Serialize dates to strings to avoid passing Date objects to client component
    // Although Next.js might handle it, explicit serialization is safer.
    const serializedHistory = history.map(d => ({
        ...d,
        date: d.date.toISOString(),
        numbers: d.numbers,
        stars: d.stars,
        // We don't need draw order for this simulation
    }));

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <BackButton href="/" />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>💸</span> Simulador de Investimento
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Teste a rentabilidade histórica da sua chave. Se tivesse jogado sempre os mesmos números, estaria rico?
                            </p>
                        </div>
                    </div>

                    <InvestmentSimulatorClient history={serializedHistory} />
                </div>
            </div>
        </div>
    );
}
