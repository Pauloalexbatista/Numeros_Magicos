import RandomForestClient from '@/components/RandomForestClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function RandomForestPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>🌲</span> Random Forest AI
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Árvores de Decisão Ensemble - Votação inteligente
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica do Random Forest">
                        <p>
                            O <strong>Random Forest</strong> é um algoritmo de aprendizagem ensemble que constrói
                            múltiplas árvores de decisão durante o treino e combina suas previsões através de votação.
                        </p>
                        <p className="mt-2">
                            Cada árvore é treinada com uma amostra aleatória diferente do histórico de sorteios,
                            criando diversidade entre as árvores. Esta diversidade é a chave para a robustez do modelo.
                        </p>
                        <p className="mt-2">
                            <strong>Como Funciona:</strong>
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Cria múltiplas árvores de decisão independentes</li>
                            <li>Cada árvore vota nos números mais prováveis</li>
                            <li>Combina votos através de votação majoritária</li>
                            <li>Reduz overfitting através da diversidade</li>
                        </ul>
                        <p className="mt-2">
                            <strong>Vantagens:</strong> Menos propenso a overfitting que uma única árvore,
                            robusto a outliers, e capaz de capturar relações não-lineares complexas nos dados.
                        </p>
                        <p className="mt-2">
                            <strong>Limitação:</strong> Mesmo com ensemble learning avançado, cada sorteio
                            é matematicamente independente. Use como ferramenta de análise estatística.
                        </p>
                    </LogicExplanation>

                    <RandomForestClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
