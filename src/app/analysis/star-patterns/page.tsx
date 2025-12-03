
import StarPatternsClient from '@/components/StarPatternsClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function StarPatternsPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>⭐</span> Padrões de Estrelas
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Análise de Par/Ímpar e Alto/Baixo para as Estrelas.
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica dos Padrões de Estrelas">
                        <p>
                            Esta ferramenta analisa o <strong>equilíbrio estatístico</strong> das 2 estrelas sorteadas,
                            focando-se em duas propriedades:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                            <li><strong>Par/Ímpar:</strong> Quantas vezes saem 2 pares, 2 ímpares, ou 1 de cada</li>
                            <li><strong>Alto/Baixo:</strong> Estrelas 1-6 (Baixo) vs 7-12 (Alto)</li>
                        </ul>
                        <p className="mt-2">
                            O padrão mais comum historicamente é <strong>1 Par + 1 Ímpar</strong> e <strong>1 Alto + 1 Baixo</strong>.
                        </p>
                    </LogicExplanation>

                    <StarPatternsClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
