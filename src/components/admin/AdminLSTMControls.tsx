'use client';

import { useState } from 'react';
import { RefreshCw, Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminLSTMControlsProps {
    type: 'NUMBERS' | 'STARS';
    variant?: 'purple' | 'yellow';
}

export default function AdminLSTMControls({ type, variant = 'purple' }: AdminLSTMControlsProps) {
    const [isRetraining, setIsRetraining] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        duration?: string;
    } | null>(null);

    const isYellow = variant === 'yellow';

    const baseClasses = isYellow
        ? "bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-950 dark:to-amber-900 border-2 border-yellow-400 dark:border-yellow-600"
        : "bg-gradient-to-br from-purple-900 to-purple-800 border-2 border-purple-600";

    const textClasses = isYellow
        ? "text-yellow-900 dark:text-yellow-100"
        : "text-white";

    const subTextClasses = isYellow
        ? "text-yellow-700 dark:text-yellow-300"
        : "text-purple-200";

    const badgeClasses = isYellow
        ? "bg-yellow-200/50 dark:bg-yellow-900/50"
        : "bg-purple-950/50";

    const buttonClasses = isYellow
        ? (isRetraining ? "bg-yellow-400 dark:bg-yellow-700 cursor-not-allowed opacity-50" : "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-500 shadow-lg hover:shadow-xl text-yellow-950 dark:text-yellow-50")
        : (isRetraining ? "bg-purple-600 cursor-not-allowed opacity-50" : "bg-purple-600 hover:bg-purple-500 shadow-lg hover:shadow-xl text-white");

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
        <div className={`rounded-2xl p-6 ${baseClasses}`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <Zap className={`w-6 h-6 ${isYellow ? 'text-yellow-600 dark:text-yellow-400' : 'text-yellow-400'}`} />
                <div>
                    <h3 className={`font-bold ${textClasses}`}>Admin: Retreino LSTM</h3>
                    <p className={`text-xs ${subTextClasses}`}>Forçar retreino do modelo {type}</p>
                </div>
            </div>

            {/* Badge Info */}
            <div className={`rounded-lg p-3 mb-4 ${badgeClasses}`}>
                <div className={`text-xs space-y-1 ${subTextClasses}`}>
                    <div>🧠 Modelo: LSTM TensorFlow.js</div>
                    <div>📊 Training: ~200 sorteios</div>
                    <div>⏱️ Duração: ~5-10 segundos</div>
                </div>
            </div>

            {/* Button */}
            <button
                onClick={handleRetrain}
                disabled={isRetraining}
                className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${buttonClasses}`}
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
