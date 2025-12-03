import BronzeSystemClient from '@/components/BronzeSystemClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function BronzeSystemPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2 text-orange-700 dark:text-orange-500">
                                <span>🥉</span> Sistema Bronze
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Ensemble Diversificado (Top 9 Sistemas)
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica do Sistema Bronze">
                        <p>
                            O <strong>Sistema Bronze</strong> foca na diversidade de estratégias.
                            Ele combina os <strong>9 sistemas com melhor desempenho</strong>, capturando uma vasta gama de padrões.
                        </p>
                        <p className="mt-2">
                            <strong>Como funciona:</strong>
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Seleciona dinamicamente o TOP 9 do ranking</li>
                            <li>Inclui sistemas matemáticos, estatísticos e de IA</li>
                            <li>Ideal para encontrar números que escapam aos modelos mais rígidos</li>
                        </ul>
                    </LogicExplanation>

                    <BronzeSystemClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
