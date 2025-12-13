'use client';

import React from 'react';

export default function MLUpdateClient() {
    return (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">🧠 Atualização AI (Flash AI)</h3>
            <p className="text-sm text-zinc-500 mb-4">
                Treina os modelos de Inteligência Artificial (Random Forest, LSTM, Regressão Logística) com os dados mais recentes.
                <br />
                <span className="font-bold text-amber-600">⚠️ Obrigatório correr após cada sorteio para manter a IA inteligente!</span>
            </p>

            {/* Instructions instead of button */}
            <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border-2 border-purple-500 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📁</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">Execute localmente:</span>
                </div>
                <code className="block bg-black/80 text-green-400 px-4 py-3 rounded font-mono text-sm">
                    .\tools\ML_UPDATE.bat
                </code>
                <p className="text-xs text-zinc-500 mt-3">
                    💡 Execute este ficheiro enquanto o Docker está a correr. Demora 1-2 minutos.
                </p>
            </div>
        </div>
    );
}
