'use client';

import React from 'react';

export default function FlashUpdateClient() {
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleBackfill = async () => {
        if (!confirm('Isto vai recalcular o ranking dos últimos 100 sorteios. Continuar?')) return;
        setLoading(true);
        setMessage('A processar últimos 100 sorteios...');
        try {
            // Dynamically import the action to avoid build issues if strictly typed differently elsewhere
            const { triggerBackfill } = await import('../../app/actions');
            await triggerBackfill(100);
            setMessage('✅ Atualização Histórica Concluída!');
        } catch (error) {
            console.error(error);
            setMessage('❌ Erro na atualização.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">⚡ Atualização Histórica (Online)</h3>
            <p className="text-sm text-zinc-500 mb-4">
                Recalcula o ranking dos últimos 100 sorteios. Essencial para ativar novos sistemas.
            </p>

            <button
                onClick={handleBackfill}
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <span className="animate-spin">⚡</span>
                        A Processar...
                    </>
                ) : (
                    '⚡ Atualizar Histórico (100 Sorteios)'
                )}
            </button>
            {message && <p className={`mt-3 text-sm text-center ${message.includes('Erro') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
        </div>
    );
}
