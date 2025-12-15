'use client';

import React from 'react';



export default function FlashUpdateClient() {
    const [status, setStatus] = React.useState<'idle' | 'running' | 'completed' | 'error'>('idle');
    const [progress, setProgress] = React.useState(0);
    const [currentBatch, setCurrentBatch] = React.useState('');
    const [logs, setLogs] = React.useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 5));

    const runFullUpdate = async () => {
        if (!confirm('Iniciar atualização histórica COMPLETA? Isto pode demorar 2-3 minutos.')) return;

        setStatus('running');
        setProgress(0);
        setLogs([]);

        try {
            const { getTotalDrawsCount, processBackfillBatch } = await import('../../app/actions');

            addLog('A obter total de sorteios...');
            const totalDraws = await getTotalDrawsCount();
            addLog(`Total sorteios: ${totalDraws}`);

            const BATCH_SIZE = 25; // Safe size for Vercel (<10s)
            let processed = 0;

            // Loop from 0 to Total
            for (let skip = 0; skip < totalDraws; skip += BATCH_SIZE) {
                // Determine batch range
                const take = Math.min(BATCH_SIZE, totalDraws - skip);

                setCurrentBatch(`Processando sorteios ${skip + 1} a ${skip + take}...`);

                // Call Server Action
                await processBackfillBatch(skip, take);

                processed += take;
                setProgress(Math.round((processed / totalDraws) * 100));

                // Small delay to let UI breathe and avoid rate limits? (Not strictly needed unless API limits)
                await new Promise(r => setTimeout(r, 100));
            }

            addLog('✅ Atualização concluída com sucesso!');
            setStatus('completed');

        } catch (error) {
            console.error(error);
            addLog('❌ Erro durante a atualização.');
            setStatus('error');
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">⚡ Atualização Histórica Robusta (Chained)</h3>
            <p className="text-sm text-zinc-500 mb-4">
                Recalcula o histórico completo (TODOS os sorteios) em pequenos lotes seguros.
                Esta é a forma recomendada para ativar novos sistemas.
            </p>

            {status === 'idle' && (
                <button
                    onClick={runFullUpdate}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    ⚡ Iniciar Atualização Completa
                </button>
            )}

            {(status === 'running' || status === 'completed' || status === 'error') && (
                <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-4 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${status === 'completed' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between text-xs text-zinc-500 font-mono">
                        <span>{progress}%</span>
                        <span>{status === 'running' ? currentBatch : status === 'completed' ? 'Completo' : 'Erro'}</span>
                    </div>

                    {/* Logs */}
                    <div className="bg-black/50 p-2 rounded text-xs font-mono text-zinc-400 h-24 overflow-y-auto">
                        {logs.map((log, i) => (
                            <div key={i} className="border-l-2 border-zinc-700 pl-2 mb-1">{log}</div>
                        ))}
                    </div>

                    {status === 'error' && (
                        <button
                            onClick={runFullUpdate}
                            className="w-full py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors text-sm"
                        >
                            Tentar Novamente
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
