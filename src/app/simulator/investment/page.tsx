
import { getHistory } from '@/app/actions';
import InvestmentSimulatorClient from '@/components/InvestmentSimulatorClient';
import { BackButton } from '@/components/ui';

export default async function InvestmentSimulatorPage() {
    const history = await getHistory();

    const serializedHistory = history.map(d => ({
        ...d,
        date: d.date.toISOString(),
        numbers: d.numbers,
        stars: d.stars,
    }));

    return (
        <div className="min-h-screen bg-surface-1 text-foreground font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center gap-4 mb-8">
                        <BackButton href="/games" />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>💸</span> Simulador de Investimento
                            </h1>
                            <p className="text-muted-foreground">
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
