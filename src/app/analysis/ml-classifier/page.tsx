'use client';

import MLClassifierClient from '@/components/MLClassifierClient';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';

export default function MLClassifierPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>📈</span> ML Classifier
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Regressão Logística - Classificação probabilística
                            </p>
                        </div>
                    </div>

                    <LogicExplanation title="Lógica do ML Classifier">
                        <p>
                            O <strong>ML Classifier</strong> utiliza <strong>Regressão Logística</strong>, um algoritmo
                            de classificação que estima probabilidades usando uma função logística (sigmoid).
                        </p>
                        <p className="mt-2">
                            Apesar do nome "regressão", este é um algoritmo de classificação que calcula a probabilidade
                            de cada número (1-50) aparecer no próximo sorteio, baseado em features estatísticas extraídas
                            do histórico.
                        </p>
                        <p className="mt-2">
                            <strong>Features Utilizadas:</strong>
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Frequência histórica de cada número</li>
                            <li>Tempo desde última aparição</li>
                            <li>Padrões de co-ocorrência</li>
                            <li>Tendências temporais</li>
                        </ul>
                        <p className="mt-2">
                            <strong>Função Sigmoid:</strong> Transforma valores em probabilidades entre 0 e 1,
                            permitindo ranking dos números mais prováveis.
                        </p>
                        <p className="mt-2">
                            <strong>Limitação:</strong> Assume relações lineares entre features.
                            Use como ferramenta de análise estatística.
                        </p>
                    </LogicExplanation>

                    <MLClassifierClient />

                    <ResponsibleGamingWarning />
                </div>
            </div>
        </div>
    );
}
