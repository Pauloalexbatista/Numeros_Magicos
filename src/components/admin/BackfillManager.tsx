'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBackfillStatus, processBackfillBatch, BackfillStatus } from '@/app/admin/backfill-actions';

export default function BackfillManager() {
    const [status, setStatus] = useState<BackfillStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    const fetchStatus = useCallback(async () => {
        try {
            const data = await getBackfillStatus();
            setStatus(data);
        } catch (error) {
            console.error('Failed to fetch status:', error);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // Timer Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (processing) {
            const startTime = Date.now();
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [processing]);

    const handleProcessBatch = async () => {
        setProcessing(true);
        setMessage(null);
        try {
            const result = await processBackfillBatch(10); // Process 10 at a time
            setMessage(result.message);
            await fetchStatus(); // Refresh status
        } catch (error) {
            setMessage('Error processing batch');
        } finally {
            setProcessing(false);
        }
    };

    if (!status) {
        return (
            <div className="p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="text-zinc-500">A carregar estado do backfill...</span>
                    <button
                        onClick={() => fetchStatus()}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                        Backfill de Sistemas Medalha
                    </h3>
                    <p className="text-sm text-zinc-500">
                        Preenchimento de histórico para Ouro, Prata e Bronze.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {status.percentage}%
                    </div>
                    <div className="text-xs text-zinc-500">
                        {status.processed} / {status.total} Sorteios
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 mb-6 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${status.percentage}%` }}
                ></div>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm">
                    {message && (
                        <span className={`font-medium ${message.includes('Error') ? 'text-red-500' : 'text-emerald-600'}`}>
                            {message}
                        </span>
                    )}
                    {!message && status.remaining > 0 && (
                        <span className="text-zinc-500">
                            Faltam {status.remaining} sorteios.
                        </span>
                    )}
                    {!message && status.remaining === 0 && (
                        <span className="text-emerald-600 font-bold">
                            ✅ Tudo atualizado!
                        </span>
                    )}
                </div>

                <button
                    onClick={handleProcessBatch}
                    disabled={processing || status.remaining === 0}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg ${processing
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                        : status.remaining === 0
                            ? 'bg-emerald-100 text-emerald-700 cursor-default'
                            : message?.includes('Successfully')
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-200 dark:ring-emerald-900'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {processing ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            A Processar ({elapsedTime}s)...
                        </span>
                    ) : status.remaining === 0 ? (
                        '✅ Concluído'
                    ) : message?.includes('Successfully') ? (
                        '✅ Lote Pronto! (Clique para Próximo)'
                    ) : (
                        '▶ Processar Lote (+10)'
                    )}
                </button>
            </div>
        </div>
    );
}
