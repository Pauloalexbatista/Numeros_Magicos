import { LSTMClient } from '@/components/LSTMClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function LSTMPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>🧠</span> LSTM Neural Net
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Rede Neural Recorrente - Aprendizagem de padrões temporais
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica do LSTM Neural Net">
                        <p>
                            O <strong>LSTM (Long Short-Term Memory)</strong> é uma arquitetura de rede neural recorrente
                            especialmente projetada para aprender dependências de longo prazo em sequências de dados.
                        </p>
                        <p className="mt-2">
                            Ao contrário das redes neurais tradicionais, o LSTM possui "células de memória" que podem
                            manter informação por longos períodos, tornando-o ideal para análise de séries temporais
                            como o histórico de sorteios do EuroMilhões.
                        </p>
                        <p className="mt-2">
                            <strong>Como Funciona:</strong>
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Processa sequências de sorteios históricos</li>
                            <li>Aprende padrões temporais complexos através de gates (portões)</li>
                            <li>Mantém memória de longo prazo de padrões relevantes</li>
                            <li>Gera previsões baseadas em padrões aprendidos</li>
                        </ul>
                        <p className="mt-2">
                            <strong>Componentes LSTM:</strong> Forget Gate (esquecimento), Input Gate (entrada),
                            Output Gate (saída) e Cell State (estado da célula) trabalham em conjunto para
                            determinar que informação manter ou descartar.
                        </p>
                        <p className="mt-2">
                            <strong>Limitação:</strong> Mesmo com IA avançada, cada sorteio do EuroMilhões é
                            matematicamente independente. Use como ferramenta de análise estatística.
                        </p>
                    </LogicExplanation>

                    <LSTMClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
