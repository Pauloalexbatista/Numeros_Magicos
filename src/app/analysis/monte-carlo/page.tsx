
import MonteCarloClient from '@/components/MonteCarloClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function MonteCarloPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>🎲</span> Simulação Monte Carlo
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Simule milhares de sorteios futuros para estimar probabilidades.
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica da Simulação Monte Carlo">
                        <p>
                            A <strong>Simulação Monte Carlo</strong> é uma técnica estatística que usa amostragem aleatória
                            repetida para estimar probabilidades. Nesta ferramenta, simulamos milhares de sorteios futuros
                            para ver com que frequência certos números aparecem.
                        </p>
                        <p className="mt-2">
                            <strong>Nota:</strong> Cada sorteio real é independente. Esta simulação serve apenas para
                            visualizar distribuições estatísticas esperadas.
                        </p>
                    </LogicExplanation>

                    <MonteCarloClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
