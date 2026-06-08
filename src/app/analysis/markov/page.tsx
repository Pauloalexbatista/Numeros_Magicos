
import MarkovClient from '@/components/MarkovClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function MarkovPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-foreground font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>🔗</span> Cadeias de Markov
                            </h1>
                            <p className="text-muted-foreground">
                                Previsão de transição de estados baseada em sequências históricas.
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica das Cadeias de Markov">
                        <p>
                            As <strong>Cadeias de Markov</strong> modelam a probabilidade de transição entre estados.
                            Neste contexto, analisamos padrões de sequências de números para prever quais números têm
                            maior probabilidade de aparecer após certos padrões históricos.
                        </p>
                        <p className="mt-2">
                            <strong>Limitação:</strong> Assume que existe dependência entre sorteios, o que matematicamente
                            não é verdade no EuroMilhões (cada sorteio é independente).
                        </p>
                    </LogicExplanation>

                    <MarkovClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
