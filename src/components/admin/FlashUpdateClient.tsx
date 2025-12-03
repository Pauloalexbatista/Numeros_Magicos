'use client';

import React, { useState } from 'react';
import { runFlashUpdate } from '@/app/admin/actions';

export default function FlashUpdateClient() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleUpdate = async () => {
        if (!confirm('Tem a certeza? Isto vai abrir uma janela preta e recalcular TUDO (Sistemas + Medalhas).')) return;

        setIsLoading(true);
        setMessage(null);

        try {
            const result = await runFlashUpdate();
            setMessage(result.message);
        } catch (error) {
            setMessage('Erro ao comunicar com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">⚡ Atualização Flash (Flash Update)</h3>
            <p className="text-sm text-zinc-500 mb-4">
                Recalcula toda a história, atualiza rankings e gera previsões para todos os sistemas (incluindo Ouro/Prata/Bronze e Platina).
            </p>

            <button
                onClick={handleUpdate}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${isLoading
                    ? 'bg-zinc-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                    }`}
            >
                {isLoading ? 'A Iniciar...' : '🚀 INICIAR ATUALIZAÇÃO TOTAL'}
            </button>

            {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {message}
                </div>
            )}
        </div>
    );
}
