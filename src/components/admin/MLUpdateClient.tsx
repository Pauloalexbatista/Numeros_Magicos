'use client';

import React, { useState } from 'react';
import { runMLUpdate } from '@/app/admin/actions';

export default function MLUpdateClient() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleUpdate = async () => {
        if (!confirm('Tem a certeza? Isto vai abrir uma janela preta e treinar os modelos de IA (Random Forest, LSTM, etc.). Pode demorar 1-2 minutos.')) return;

        setIsLoading(true);
        setMessage(null);

        try {
            const result = await runMLUpdate();
            setMessage(result.message);
        } catch (error) {
            setMessage('Erro ao comunicar com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">🧠 Atualização AI (Flash AI)</h3>
            <p className="text-sm text-zinc-500 mb-4">
                Treina os modelos de Inteligência Artificial (Random Forest, LSTM, Regressão Logística) com os dados mais recentes.
                <br />
                <span className="font-bold text-amber-600">⚠️ Obrigatório correr após cada sorteio para manter a IA inteligente!</span>
            </p>

            <button
                onClick={handleUpdate}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${isLoading
                    ? 'bg-zinc-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                    }`}
            >
                {isLoading ? 'A Treinar...' : '🧠 TREINAR CÉREBROS DIGITAIS'}
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
