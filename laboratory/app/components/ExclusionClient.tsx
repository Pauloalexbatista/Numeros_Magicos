'use client';

import { useState, useEffect } from 'react';
import { Ban, Snowflake } from 'lucide-react';

interface ExclusionData {
    candidates: { number: number; hits: number }[];
    analyzedDraws: number;
}

export default function ExclusionClient() {
    const [data, setData] = useState<ExclusionData | null>(null);

    useEffect(() => {
        fetch('/api/exclusion')
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    if (!data) return <div className="p-8 text-white">A carregar análise de exclusão...</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-2">
                    Simulação de Exclusão
                </h1>
                <p className="text-slate-400 mb-12">
                    Análise estatística para identificar os números "mais frios" candidatos a exclusão.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* The Excluded Ones */}
                    <div className="bg-red-900/10 border border-red-900/50 rounded-2xl p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Ban className="w-24 h-24 text-red-500" />
                        </div>

                        <h2 className="text-red-400 font-bold uppercase tracking-widest mb-8 relative z-10">
                            Recomendação de Exclusão (Top 6)
                        </h2>

                        <div className="flex justify-center gap-4 flex-wrap relative z-10">
                            {data.candidates.slice(0, 6).map((item) => (
                                <div key={item.number} className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border-2 border-red-500/50 relative group cursor-help">
                                    <span className="text-2xl font-bold text-red-400 group-hover:opacity-20 transition-opacity">{item.number}</span>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs text-red-300 font-bold">{item.hits}x</span>
                                    </div>
                                    <div className="absolute inset-0 border-t-2 border-red-500/30 rotate-45 transform origin-center"></div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-red-500/50 mt-4 relative z-10">Passar o rato para ver frequência</p>
                    </div>

                    {/* Stats Panel */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Snowflake className="text-cyan-400" />
                                <h3 className="font-bold text-slate-300">Análise de Frequência</h3>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                Analisados os últimos <strong>{data.analyzedDraws} sorteios</strong>.
                                Os números apresentados são os que tiveram a menor frequência absoluta.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li className="flex justify-between border-b border-slate-800 pb-1">
                                    <span>Base de Dados:</span>
                                    <span className="text-slate-300">Completa</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-800 pb-1">
                                    <span>Algoritmo:</span>
                                    <span className="text-slate-300">Cold Frequency</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
