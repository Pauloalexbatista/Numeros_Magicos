
import { getHistory } from '@/app/actions';
import PositionalAnalysisClient from '@/components/PositionalAnalysisClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default async function PositionalAnalysisPage() {
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
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>📏</span> Análise Posicional
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Analise a distribuição de cada posição (1º ao 5º número) e crie pools baseadas no Desvio Padrão.
                            </p>
                        </div>
                    </div>

                    {/* Logic Explanation */}
                    <LogicExplanation title="Lógica da Análise Posicional">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                                    📊 Conceito Base
                                </h4>
                                <p>
                                    Cada sorteio do EuroMilhões tem 5 números ordenados (1º ao 5º). Esta ferramenta analisa
                                    a <strong>distribuição estatística</strong> de cada posição individualmente.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                                    📏 Desvio Padrão (SD)
                                </h4>
                                <p>
                                    O <strong>Desvio Padrão</strong> mede a "dispersão" dos números em cada posição.
                                    Por exemplo, se a 1ª posição tem uma média de 7 e um SD de 3, significa que 68% dos sorteios
                                    têm o 1º número entre 4 e 10.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                                    🎯 Como Usar
                                </h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Ajuste o <strong>Histórico</strong> (20-1000 sorteios) para definir a janela de análise</li>
                                    <li>Ajuste a <strong>Tolerância</strong> (0.1-3.0 SD) para cada posição</li>
                                    <li>Valores baixos (0.5-1.0) = Pool pequena e focada</li>
                                    <li>Valores altos (2.0-3.0) = Pool grande e abrangente</li>
                                    <li>Use a Pool gerada como filtro para Desdobramentos</li>
                                </ul>
                            </div>

                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                                    💡 Vantagem vs Outros Filtros
                                </h4>
                                <p className="text-xs">
                                    Ao contrário de "Quentes/Frios" que analisam frequência global, a Análise Posicional
                                    considera a <strong>ordem natural</strong> dos números, o que é estatisticamente mais robusto.
                                </p>
                            </div>
                        </div>
                    </LogicExplanation>

                    {/* Main Tool */}
                    <PositionalAnalysisClient history={serializedHistory} />

                    {/* Responsible Gaming Warning */}
                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
