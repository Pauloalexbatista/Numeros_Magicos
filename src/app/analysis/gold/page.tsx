import GoldSystemClient from '@/components/GoldSystemClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function GoldSystemPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                <span>🥇</span> Sistema Ouro
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Ensemble Elite (Top 3 Sistemas)
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica do Sistema Ouro">
                        <p>
                            O <strong>Sistema Ouro</strong> é o nosso ensemble mais exclusivo e preciso.
                            Ele combina apenas os <strong>3 sistemas com melhor desempenho</strong> no ranking atual.
                        </p>
                        <p className="mt-2">
                            <strong>Como funciona:</strong>
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Seleciona dinamicamente o TOP 3 do ranking</li>
                            <li>Cada sistema vota nos seus 25 números</li>
                            <li>Votos são ponderados pela precisão de cada sistema</li>
                            <li>Resultado: Uma previsão de altíssima qualidade e consenso</li>
                        </ul>
                    </LogicExplanation>

                    <GoldSystemClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
