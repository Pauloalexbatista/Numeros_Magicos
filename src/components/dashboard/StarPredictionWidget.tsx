
'use client';

import { useEffect, useState } from 'react';
import { getStarSuggestions } from '@/app/analysis/stars/actions';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function StarPredictionWidget() {
    const [suggestions, setSuggestions] = useState<any>(null);

    useEffect(() => {
        getStarSuggestions().then(setSuggestions);
    }, []);

    if (!suggestions) return <div className="animate-pulse h-48 bg-slate-800/50 rounded-xl" />;

    const formatPair = (pair: string) => pair.split('-').map(n => n.padStart(2, '0')).join('+');

    return (
        <Card className="h-full p-6 bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border-indigo-500/20 backdrop-blur-sm flex flex-col justify-between group hover:border-indigo-500/40 transition-all">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-indigo-300 flex items-center gap-2">
                        ⭐ Previsões de Estrelas
                    </h3>
                    <Link href="/analysis/stars" className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                        Ver Análise &rarr;
                    </Link>
                </div>

                <div className="space-y-4">
                    {/* Golden Pair */}
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-yellow-500 tracking-wider">Ouro 👑</span>
                            <span className="text-xs text-slate-400">Histórico</span>
                        </div>
                        <div className="text-xl font-black text-white tracking-tight">
                            {formatPair(suggestions.golden.pair)}
                        </div>
                    </div>

                    {/* Hot Pair */}
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Momento 🔥</span>
                            <span className="text-xs text-slate-400">Últimos 100</span>
                        </div>
                        <div className="text-xl font-black text-white tracking-tight">
                            {formatPair(suggestions.hot.pair)}
                        </div>
                    </div>

                    {/* Rational Pair */}
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Racional 🧠</span>
                            <span className="text-xs text-slate-400">Estatístico</span>
                        </div>
                        <div className="text-xl font-black text-white tracking-tight">
                            {formatPair(suggestions.rational.pair)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-[10px] text-center text-slate-500">
                Sugestões baseadas em IA e estatística pura.
            </div>
        </Card>
    );
}
