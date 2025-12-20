
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Table2, Wand2 } from 'lucide-react';
import SystemComplementarityClient from '../components/SystemComplementarityClient';
import MatrixView from '../components/MatrixView';

export default function ComplementarityPage() {
    const [mode, setMode] = useState<'auto' | 'manual'>('manual');

    return (
        <div className="min-h-screen bg-slate-950 p-4 font-sans text-slate-200">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Voltar ao Laboratório
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Complementaridade</h1>
                        <p className="text-slate-400">Analise como os sistemas se comportam em conjunto</p>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button
                            onClick={() => setMode('manual')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'manual'
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Table2 className="w-4 h-4" />
                            Matriz Manual
                        </button>
                        <button
                            onClick={() => setMode('auto')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'auto'
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Wand2 className="w-4 h-4" />
                            Busca Automática
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto">
                {mode === 'manual' ? (
                    <MatrixView />
                ) : (
                    <SystemComplementarityClient />
                )}
            </div>
        </div>
    );
}

