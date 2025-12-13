'use client';

import React from 'react';

export default function FlashUpdateClient() {
    return (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">⚡ Atualização Flash (Flash Update)</h3>
            <p className="text-sm text-zinc-500 mb-4">
                Recalcula toda a história, atualiza rankings e gera previsões para todos os sistemas (incluindo Ouro/Prata/Bronze e Platina).
            </p>

            {/* Instructions instead of button */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-600/10 border-2 border-amber-500 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📁</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">Execute localmente:</span>
                </div>
                <code className="block bg-black/80 text-green-400 px-4 py-3 rounded font-mono text-sm">
                    .\tools\ATUALIZACAO_FLASH.bat
                </code>
                <p className="text-xs text-zinc-500 mt-3">
                    💡 Execute este ficheiro enquanto o Docker está a correr. A BD será atualizada automaticamente.
                </p>
            </div>
        </div>
    );
}
