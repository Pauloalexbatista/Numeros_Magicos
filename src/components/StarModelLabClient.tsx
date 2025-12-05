'use client';

import { useState } from 'react';
import { Draw, PredictionModel, PredictionResult } from '@/models/types';
import { HotStarsModel, ColdStarsModel, RandomStarsModel } from '@/models/implementations/StarModels';
import { getHistory } from '@/app/actions';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

interface Props {
    history: Draw[];
}

export default function StarModelLabClient({ history }: Props) {
    const [selectedModelId, setSelectedModelId] = useState<string>('hot_stars');
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const models: PredictionModel[] = [
        new HotStarsModel(),
        new ColdStarsModel(),
        new RandomStarsModel()
    ];

    const handlePredict = async () => {
        setIsCalculating(true);

        // Simulate calculation delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const model = models.find(m => m.id === selectedModelId);
        if (model) {
            // Predict 2 stars
            const result = await model.predict(history, 2);
            setPrediction(result);
        }

        setIsCalculating(false);
    };

    const selectedModel = models.find(m => m.id === selectedModelId);

    return (
        <div className="space-y-8">
            {/* Model Selection */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <span>⭐</span> Escolha o Modelo de Estrelas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {models.map(model => (
                        <button
                            key={model.id}
                            onClick={() => {
                                setSelectedModelId(model.id);
                                setPrediction(null);
                            }}
                            className={`p-4 rounded-lg border text-left transition-all ${selectedModelId === model.id
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 ring-2 ring-amber-500/20'
                                : 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <div className="font-bold text-lg mb-1">{model.name}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{model.description}</div>
                        </button>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handlePredict}
                        disabled={isCalculating}
                        className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCalculating ? 'A Calcular...' : 'Gerar Previsão de Estrelas'}
                    </button>
                </div>
            </div>

            {/* Prediction Result */}
            {prediction && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-1 rounded-2xl shadow-xl">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 text-center">
                            <h2 className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-sm font-bold mb-6">
                                Estrelas Previstas ({selectedModel?.name})
                            </h2>

                            <div className="flex justify-center gap-4 mb-8">
                                {prediction.stars?.map((star, idx) => (
                                    <div key={idx} className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center border-4 border-amber-500 text-amber-600 dark:text-amber-400 text-3xl font-bold shadow-inner">
                                        {star}
                                    </div>
                                ))}
                            </div>

                            {prediction.reasoning && (
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg text-sm text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
                                    <span className="font-bold block mb-1">Lógica:</span>
                                    {prediction.reasoning}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <ResponsibleGamingFooter />
        </div>
    );
}
