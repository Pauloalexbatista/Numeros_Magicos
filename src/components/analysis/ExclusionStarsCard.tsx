'use client';

import { useState } from 'react';
import { Loader2, Ban, Info } from 'lucide-react';

interface ExclusionStarsCardProps {
    excluded?: number[];
    confidence?: number;
    reliability?: number; // NEW
    lastUpdate?: Date;
    isLoading?: boolean;
}

export default function ExclusionStarsCard({
    excluded = [],
    confidence = 0,
    reliability = 0, // NEW
    lastUpdate,
    isLoading = false
}: ExclusionStarsCardProps) {

    const [showModal, setShowModal] = useState(false);

    if (isLoading) {
        return (
            <div className="rounded-2xl border-2 p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-600 dark:text-yellow-400" />
                    <span className="ml-3 text-yellow-700 dark:text-yellow-300 font-medium">
                        A treinar modelo LSTM...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-2xl border-2 p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 hover:shadow-xl transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/50 dark:bg-black/50 text-red-600 dark:text-red-400">
                            <Ban className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight">
                                🚫 Exclusão Inteligente
                            </h3>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                Estrelas com MENOR probabilidade
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="p-2 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded-lg transition-colors"
                        title="Como funciona?"
                    >
                        <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </button>
                </div>

                {/* Excluded Stars */}
                {excluded.length > 0 ? (
                    <>
                        <div className="flex justify-center gap-6 mb-8 transform scale-110">
                            {excluded.map((star) => (
                                <div
                                    key={star}
                                    className="relative w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center border-4 border-red-500 dark:border-red-600 text-red-700 dark:text-red-300 text-4xl font-black shadow-xl"
                                >
                                    <span className="relative z-10 drop-shadow-md">{star}</span>
                                    <div className="absolute inset-0 flex items-center justify-center z-30 opacity-60">
                                        <div className="w-[120%] h-1 bg-red-600 dark:bg-red-500 rotate-45 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-white/50 dark:bg-black/30 p-2 rounded-lg text-center">
                                <div className="text-[10px] text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-1">
                                    Confiança IA
                                </div>
                                <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                                    {confidence.toFixed(0)}%
                                </div>
                            </div>
                            <div className="bg-white/50 dark:bg-black/30 p-2 rounded-lg text-center">
                                <div className="text-[10px] text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-1">
                                    Fiabilidade
                                </div>
                                <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                                    {reliability.toFixed(0)}%
                                </div>
                            </div>
                            <div className="bg-white/50 dark:bg-black/30 p-2 rounded-lg text-center">
                                <div className="text-[10px] text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-1">
                                    Excluir
                                </div>
                                <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                                    {excluded.length} ⭐
                                </div>
                            </div>
                        </div>

                        {/* Last Update */}
                        {lastUpdate && (
                            <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                                Último update: {new Date(lastUpdate).toLocaleDateString('pt-PT')}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                        Sem previsões disponíveis
                    </div>
                )}
            </div>

            {/* Modal Explicativo */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                🧠 Como Funciona a Exclusão de Estrelas?
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 text-zinc-700 dark:text-zinc-300">
                            <p className="text-lg font-medium">
                                Este sistema usa <strong>Inteligência Artificial (LSTM)</strong> para identificar
                                estrelas com <strong className="text-red-600 dark:text-red-400">MENOR probabilidade</strong> de sair.
                            </p>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                                <h3 className="font-bold mb-2 text-yellow-700 dark:text-yellow-300">💡 Como funciona?</h3>
                                <ol className="list-decimal list-inside space-y-2 text-sm">
                                    <li><strong>Treino:</strong> A rede neuronal analisa todos os sorteios históricos</li>
                                    <li><strong>Padrões:</strong> Aprende quais estrelas tendem a NÃO sair juntas</li>
                                    <li><strong>Previsão:</strong> Indica {excluded.length} estrelas para EXCLUIR das apostas</li>
                                    <li><strong>Cache:</strong> Resultados guardados para performance</li>
                                </ol>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                                <h3 className="font-bold mb-2 text-amber-700 dark:text-amber-300">🎯 Vantagem</h3>
                                <ul className="space-y-1 text-sm">
                                    <li>❌ Eliminar estrelas improváveis</li>
                                    <li>✅ Focar em estrelas mais prováveis</li>
                                    <li>📉 Reduzir combinações inúteis</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <h3 className="font-bold mb-2 text-blue-700 dark:text-blue-300">📊 Precisão</h3>
                                <p className="text-sm">
                                    Histórico de <strong>{confidence.toFixed(0)}%</strong> de sucesso
                                    (não acerta estrelas excluídas nos últimos testes)
                                </p>
                            </div>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                                ⚠️ Aviso: Nenhum sistema garante resultados. Use com responsabilidade.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-6 w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Entendi!
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
