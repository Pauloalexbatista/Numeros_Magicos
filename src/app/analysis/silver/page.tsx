import SilverSystemClient from '@/components/SilverSystemClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function SilverSystemPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span>🥈</span> Sistema Prata
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Ensemble Equilibrado (Top 6 Sistemas)
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica do Sistema Prata">
                        <p>
                            O <strong>Sistema Prata</strong> oferece o equilíbrio perfeito entre precisão e diversidade.
                            Ele combina os <strong>6 sistemas com melhor desempenho</strong>.
                        </p>
                        <p className="mt-2">
                            <strong>Como funciona:</strong>
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Seleciona dinamicamente o TOP 6 do ranking</li>
                            <li>Combina a elite (Top 3) com os desafiantes (4º-6º)</li>
                            <li>Maior cobertura de padrões que o Ouro, mantendo alta qualidade</li>
                        </ul>
                    </LogicExplanation>

                    <SilverSystemClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
