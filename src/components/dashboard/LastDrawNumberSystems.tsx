
'use client';

import { useEffect, useState } from 'react';
import { Hash, Trophy, Minus } from 'lucide-react';
import { getLastDrawNumberSystems } from '@/app/ranking/actions';

interface SystemResult {
    systemName: string;
    hits: number;
}

export default function LastDrawNumberSystems() {
    const [results, setResults] = useState<SystemResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastDrawDate, setLastDrawDate] = useState<string>('');

    useEffect(() => {
        async function load() {
            try {
                const data = await getLastDrawNumberSystems();
                if (data.date) {
                    setLastDrawDate(data.date);
                    // Filter mainly those with good hits
                    // For numbers (5 total), 5 is jackpot, 4 is great, 3 is good
                    setResults(data.systems.sort((a, b) => b.hits - a.hits));
                }
            } catch (e) {
                console.error("Failed to load last draw number systems", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="rounded-xl p-6 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 h-full flex items-center justify-center min-h-[160px]">
                <div className="animate-spin text-green-500">
                    <Hash className="w-6 h-6" />
                </div>
            </div>
        );
    }

    // Filter only those with at least 1 hit (or maybe 2 to be stricter?)
    // User asked for "1/2" or "4/5" format. 
    // We will show all > 0 but highlight top ones.
    const winners = results.filter(r => r.hits > 0);
    const perfectWinners = results.filter(r => r.hits === 5);

    return (
        <div className="rounded-xl border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/10 overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-green-200 dark:border-green-800/50 flex justify-between items-center bg-white/50 dark:bg-black/20">
                <div>
                    <h3 className="font-bold text-lg text-green-800 dark:text-green-200 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-green-600" />
                        Melhores Sistemas de Números em <span className="text-sm font-semibold opacity-90 text-green-700 dark:text-green-300">({lastDrawDate})</span>
                    </h3>
                </div>
                {perfectWinners.length > 0 && (
                    <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold shadow-lg animate-pulse">
                        {perfectWinners.length} JACKPOTS!
                    </span>
                )}
            </div>

            {/* List */}
            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {winners.length > 0 ? (
                    <div className="space-y-2">
                        {winners.map((result, idx) => (
                            <div key={result.systemName} className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-black/40 border border-green-100 dark:border-green-900/50 hover:bg-white dark:hover:bg-black/60 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        h-8 px-3 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm min-w-[3.5rem]
                                        ${result.hits === 5 ? 'bg-green-500 text-white ring-2 ring-green-300 dark:ring-green-600' :
                                            result.hits === 4 ? 'bg-green-400 text-white' :
                                                'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'}
                                    `}>
                                        {result.hits}/5
                                    </div>
                                    <span className="font-bold text-zinc-700 dark:text-zinc-200 truncate max-w-[180px]">
                                        {result.systemName}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    {result.hits === 5 && <span className="text-xs font-bold text-green-600 dark:text-green-400">PERFEITO!</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-zinc-400 dark:text-zinc-500">
                        <Minus className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Nenhum sistema acertou números.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
