import RootSumClient from '@/components/RootSumClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function RootSumPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>🔢</span> Root Sum
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Raiz Digital Numerológica - Análise de dígitos
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica do Root Sum">
                        <p>
                            O <strong>Root Sum</strong> (Raiz Digital) é baseado em numerologia, calculando a
                            soma recursiva dos dígitos de um número até obter um único dígito (1-9).
                        </p>
                        <p className="mt-2">
                            <strong>Exemplo:</strong> 47 → 4+7=11 → 1+1=2 (raiz digital é 2)
                        </p>
                        <p className="mt-2">
                            O sistema analisa padrões de raiz digital no histórico e identifica números
                            cujas raízes digitais aparecem com maior frequência.
                        </p>
                        <p className="mt-2">
                            <strong>Aplicação:</strong> Identifica números com raízes digitais "quentes"
                            baseando-se em padrões históricos de distribuição numerológica.
                        </p>
                        <p className="mt-2">
                            <strong>Limitação:</strong> Baseado em numerologia, não em matemática estatística.
                            Use apenas como ferramenta de análise alternativa.
                        </p>
                    </LogicExplanation>

                    <RootSumClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
