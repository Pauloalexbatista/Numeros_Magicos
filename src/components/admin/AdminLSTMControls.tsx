'use client';

import { useState } from 'react';
import { RefreshCw, Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminLSTMControlsProps {
    type: 'NUMBERS' | 'STARS';
}

export default function AdminLSTMControls({ type }: AdminLSTMControlsProps) {
    const [isRetraining, setIsRetraining] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        duration?: string;
    } | null>(null);

    const handleRetrain = async () => {
        setIsRetraining(true);
        setResult(null);

        try {
            const response = await fetch('/api/exclusion/retrain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setResult({
                    success: true,
                    message: data.message,
                    duration: data.duration
                });

                // Reload page after 2 seconds to show new prediction
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setResult({
                    success: false,
                    message: data.error || 'Erro ao retreinar'
                });
            }
        } catch (error) {
            setResult({
                success: false,
                message: 'Erro de conexão'
            });
        } finally {
            setIsRetraining(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-2xl p-6 border-2 border-purple-600">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <div>
                    <h3 className="font-bold text-white">Admin: Retreino LSTM</h3>
                    <p className="text-xs text-purple-200">Forçar retreino do modelo {type}</p>
                </div>
            </div>

            {/* Badge Info */}
            <div className="bg-purple-950/50 rounded-lg p-3 mb-4">
                <div className="text-xs text-purple-200 space-y-1">
                    <div>🧠 Modelo: LSTM TensorFlow.js</div>
                    <div>📊 Training: ~200 sorteios</div>
                    <div>⏱️ Duração: ~5-10 segundos</div>
                </div>
            </div>

            {/* Button */}
            <button
                onClick={handleRetrain}
                disabled={isRetraining}
                className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isRetraining
                        ? 'bg-purple-600 cursor-not-allowed opacity-50'
                        : 'bg-purple-600 hover:bg-purple-500 shadow-lg hover:shadow-xl'
                    } text-white`}
            >
                {isRetraining ? (
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        A Retreinar...
                    </>
                ) : (
                    <>
                        <Zap className="w-5 h-5" />
                        Força Retreino
                    </>
                )}
            </button>

            {/* Result */}
            {result && (
                <div
                    className={`mt-4 p-4 rounded-lg border-2 ${result.success
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200'
                        }`}
                >
                    <div className="flex items-start gap-2">
                        {result.success ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <div className="font-bold text-sm">{result.message}</div>
                            {result.duration && (
                                <div className="text-xs mt-1">Duração: {result.duration}</div>
                            )}
                            {result.success && (
                                <div className="text-xs mt-2 italic">Recarregando página...</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
