
'use client';

import { useEffect, useState } from 'react';
import { Star, Trophy, Minus } from 'lucide-react';

// Create a client-side version of this widget to fetch the last draw results for stars
// We can use the existing server actions or creating a new one if needed to get "who won this round"
import { getStarSystemRanking, getStarSystemDetails } from '@/app/analysis/stars/actions';

interface SystemResult {
    systemName: string;
    hits: number;
    stars: number[];
}

export default function LastDrawStarSystems() {
    const [results, setResults] = useState<SystemResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastDrawDate, setLastDrawDate] = useState<string>('');

    useEffect(() => {
        async function load() {
            try {
                // We need to find which systems predicted the stars correctly for the LAST draw
                // This is a bit resource intensive if check all, so we'll check top 10 systems
                const ranking = await getStarSystemRanking();
                const top10 = ranking.slice(0, 10);

                const winners: SystemResult[] = [];
                let drawDate = '';

                // Check performance for each system
                // Optimization: In a real app, this should be a single efficient query on the server
                // For now, we iterate client-side loading or optimize server-side

                // Let's rely on fetching the detailed history of the top systems
                // and looking at the first item (most recent draw)

                const promises = top10.map(async (sys) => {
                    const details = await getStarSystemDetails(sys.systemName);
                    if (details && details.history.length > 0) {
                        const lastDraw = details.history[0]; // Most recent
                        drawDate = new Date(lastDraw.draw.date).toLocaleDateString('pt-PT');
                        // Store the stars from the draw for reference

                        return {
                            systemName: sys.systemName,
                            hits: lastDraw.hits,
                            stars: typeof lastDraw.draw.stars === 'string' ? JSON.parse(lastDraw.draw.stars) : lastDraw.draw.stars
                        };
                    }
                    return null;
                });

                const systemResults = (await Promise.all(promises)).filter(r => r !== null) as SystemResult[];

                // Sort by hits (descending)
                setResults(systemResults.sort((a, b) => b.hits - a.hits));
                setLastDrawDate(drawDate);

            } catch (e) {
                console.error("Failed to load last draw star systems", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 h-full flex items-center justify-center min-h-[160px]">
                <div className="animate-spin text-yellow-500">
                    <Star className="w-6 h-6" />
                </div>
            </div>
        );
    }

    // Filter only those with at least 1 hit
    const winners = results.filter(r => r.hits > 0);
    const perfectWinners = results.filter(r => r.hits === 2);

    return (
        <div className="rounded-xl border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-900/10 overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-yellow-200 dark:border-yellow-800/50 flex justify-between items-center bg-white/50 dark:bg-black/20">
                <div>
                    <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        Melhores Sistemas de Estrelas em <span className="text-sm font-semibold opacity-90 text-yellow-700 dark:text-yellow-300">({lastDrawDate})</span>
                    </h3>
                </div>
                {perfectWinners.length > 0 && (
                    <span className="px-3 py-1 rounded-full bg-yellow-500 text-black text-xs font-bold shadow-lg animate-pulse">
                        {perfectWinners.length} JACKPOTS!
                    </span>
                )}
            </div>

            {/* List */}
            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {winners.length > 0 ? (
                    <div className="space-y-2">
                        {winners.map((result, idx) => (
                            <div key={result.systemName} className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-black/40 border border-yellow-100 dark:border-yellow-900/50 hover:bg-white dark:hover:bg-black/60 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        h-8 px-3 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm min-w-[3.5rem]
                                        ${result.hits === 2 ? 'bg-yellow-500 text-black ring-2 ring-yellow-300 dark:ring-yellow-600' : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'}
                                    `}>
                                        {result.hits}/2
                                    </div>
                                    <span className="font-bold text-zinc-700 dark:text-zinc-200">
                                        {result.systemName}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    {/* Visual representation of hits if we had prediction data, but simple text is fine */}
                                    {result.hits === 2 && <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">PERFEITO!</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-zinc-400 dark:text-zinc-500">
                        <Minus className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Nenhum sistema acertou estrelas neste sorteio.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
