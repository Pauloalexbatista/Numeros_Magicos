/**
 * ⚠️ CRITICAL: NEURAL NETWORK CONTROL PANEL
 * 
 * This component provides SAFE manual control for neural network training.
 * 
 * Training buttons execute .bat scripts which:
 * 1. Run offline (not in browser/API)
 * 2. Take 10-60 seconds at 80-100% CPU (NORMAL!)
 * 3. Update cache tables
 * 4. Never block the UI
 * 
 * See: NEURAL_NETWORK_RULES.md
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Brain, Calendar, Clock, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';

interface ModelStatus {
    name: string;
    type: 'EXCLUSION' | 'ML_MODELS';
    models: string[]; // List of models trained by this script
    trained: boolean;
    lastTrained?: Date;
    daysSinceTraining?: number;
    recommendedFrequency: number; // days
    scriptCommand: string;
    estimatedTime: string;
}

export default function NeuralNetworkControl() {
    const [modelGroups, setModelGroups] = useState<ModelStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState<string | null>(null);

    useEffect(() => {
        loadModelStatus();
    }, []);

    const loadModelStatus = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/neural-status');
            const data = await response.json();

            // Group models by script
            const groups: ModelStatus[] = [
                {
                    name: 'Exclusion LSTM',
                    type: 'EXCLUSION',
                    models: ['Exclusion Numbers', 'Exclusion Stars'],
                    trained: data.models?.filter((m: any) => m.type.startsWith('EXCLUSION')).every((m: any) => m.trained) || false,
                    lastTrained: data.models?.find((m: any) => m.type === 'EXCLUSION_NUMBERS')?.lastTrained
                        ? new Date(data.models.find((m: any) => m.type === 'EXCLUSION_NUMBERS').lastTrained)
                        : undefined,
                    daysSinceTraining: data.models?.find((m: any) => m.type === 'EXCLUSION_NUMBERS')?.daysSinceTraining,
                    recommendedFrequency: 7,
                    scriptCommand: 'tools\\EXCLUSION_UPDATE.bat',
                    estimatedTime: '10-20 seg'
                },
                {
                    name: 'ML Models (LSTM + Star LSTM)',
                    type: 'ML_MODELS',
                    models: ['LSTM Neural Net', 'Star LSTM'],
                    trained: data.models?.filter((m: any) => m.type === 'LSTM' || m.type === 'STAR_LSTM').every((m: any) => m.trained) || false,
                    lastTrained: data.models?.find((m: any) => m.type === 'LSTM')?.lastTrained
                        ? new Date(data.models.find((m: any) => m.type === 'LSTM').lastTrained)
                        : undefined,
                    daysSinceTraining: data.models?.find((m: any) => m.type === 'LSTM')?.daysSinceTraining,
                    recommendedFrequency: 30,
                    scriptCommand: 'tools\\ML_UPDATE.bat',
                    estimatedTime: '30-60 seg'
                }
            ];

            setModelGroups(groups);
        } catch (error) {
            console.error('Failed to load model status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (model: ModelStatus) => {
        if (!model.trained) return 'red';
        if (!model.daysSinceTraining) return 'green';
        if (model.daysSinceTraining > model.recommendedFrequency) return 'red';
        if (model.daysSinceTraining > model.recommendedFrequency * 0.7) return 'yellow';
        return 'green';
    };

    const getStatusIcon = (model: ModelStatus) => {
        const color = getStatusColor(model);
        if (color === 'red') return <AlertTriangle className="w-5 h-5 text-red-500" />;
        if (color === 'yellow') return <Clock className="w-5 h-5 text-yellow-500" />;
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    };

    const getStatusText = (model: ModelStatus) => {
        if (!model.trained) return 'Não treinado';
        if (!model.daysSinceTraining) return 'Treinado';
        if (model.daysSinceTraining > model.recommendedFrequency) return 'Necessita treino';
        if (model.daysSinceTraining > model.recommendedFrequency * 0.7) return 'Treino recomendado';
        return 'Atualizado';
    };

    const handleTrain = async (modelType: string) => {
        const confirmed = confirm(
            `⚠️ AVISO: O treino vai usar 80-100% do CPU durante ${modelType === 'EXCLUSION' ? '10-20' : '30-60'} segundos.\n\n` +
            `Isto é NORMAL e esperado.\n\n` +
            `Continuar?`
        );

        if (!confirmed) return;

        setTraining(modelType);

        try {
            const response = await fetch('/api/admin/neural-train', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: modelType })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(`✅ Treino concluído com sucesso!\n\nDuração: ${data.duration}`);
                await loadModelStatus(); // Refresh status
            } else {
                alert(`❌ Erro ao treinar:\n\n${data.error || 'Erro desconhecido'}`);
            }
        } catch (error) {
            alert(`❌ Erro de conexão:\n\n${error}`);
        } finally {
            setTraining(null);
        }
    };

    return (
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-2 border-indigo-200 dark:border-indigo-800">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                    <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        Redes Neuronais
                    </h2>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                        Cálculo Semanal/Mensal - Controlo Manual
                    </p>
                </div>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-bold mb-1">⚠️ IMPORTANTE:</p>
                        <p>
                            Clique nos botões abaixo para treinar os modelos. O processo demora 10-60 segundos
                            e vai usar 80-100% do CPU (isto é NORMAL!).
                        </p>
                    </div>
                </div>
            </div>

            {/* Model Groups */}
            {loading ? (
                <div className="text-center py-8 text-indigo-600 dark:text-indigo-400">
                    Carregando estado dos modelos...
                </div>
            ) : (
                <div className="space-y-4">
                    {modelGroups.map((group) => {
                        const statusColor = getStatusColor(group);
                        const borderColor = statusColor === 'red' ? 'border-red-300 dark:border-red-700' :
                            statusColor === 'yellow' ? 'border-yellow-300 dark:border-yellow-700' :
                                'border-green-300 dark:border-green-700';
                        const bgColor = statusColor === 'red' ? 'bg-red-50 dark:bg-red-900/10' :
                            statusColor === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/10' :
                                'bg-green-50 dark:bg-green-900/10';

                        return (
                            <div
                                key={group.type}
                                className={`p-5 border-2 rounded-xl ${borderColor} ${bgColor}`}
                            >
                                {/* Group Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(group)}
                                        <div>
                                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                                                {group.name}
                                            </h3>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                {group.models.join(' + ')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                            {getStatusText(group)}
                                        </div>
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                            Frequência
                                        </div>
                                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                            {group.recommendedFrequency === 7 ? '1x/semana' : '1x/mês'}
                                        </div>
                                    </div>
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                            Último Treino
                                        </div>
                                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                            {group.lastTrained
                                                ? new Date(group.lastTrained).toLocaleDateString('pt-PT')
                                                : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                            Há quantos dias
                                        </div>
                                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                            {group.daysSinceTraining !== undefined
                                                ? `${group.daysSinceTraining} dias`
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Train Button */}
                                <button
                                    onClick={() => handleTrain(group.type)}
                                    disabled={training === group.type}
                                    className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${training === group.type
                                        ? 'bg-zinc-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {training === group.type ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            A Treinar... ({group.estimatedTime})
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            🚀 Treinar {group.name}
                                        </>
                                    )}
                                </button>

                                {/* Script Info */}
                                <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 text-center">
                                    Script: <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">{group.scriptCommand}</code>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer Warning */}
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>⚠️ Durante o treino:</strong> O CPU vai estar a 80-100%.
                    Isto é NORMAL e esperado. Aguarde a conclusão.
                </p>
            </div>
        </Card>
    );
}
