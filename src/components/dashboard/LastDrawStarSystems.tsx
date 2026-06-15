'use client';

import { useEffect, useState } from 'react';
import { Star, Trophy, Minus } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { getLastDrawStarResults } from '@/app/analysis/stars/actions';
import { formatSystemName } from '@/utils/formatters';
import { GameType } from '@/types/game';

interface SystemResult {
    systemName: string;
    hits: number;
    stars: number[];
}

interface LastDrawStarSystemsProps {
    game?: GameType;
}

export default function LastDrawStarSystems({ game = GameType.EUROMILLIONS }: LastDrawStarSystemsProps) {
    const t = useTranslations('dashboard');
    const locale = useLocale();
    const [results, setResults] = useState<SystemResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastDrawDate, setLastDrawDate] = useState<string>('');

    const isTotoloto = game === GameType.TOTOLOTO;
    const isEuroDreams = game === GameType.EURODREAMS;
    const maxStars = isTotoloto ? 1 : isEuroDreams ? 1 : 2;
    const starLabel = isTotoloto ? 'Numero da Sorte' : isEuroDreams ? 'Sonho' : 'Estrelas';

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const data = await getLastDrawStarResults(game);
                if (!cancelled && data) {
                    if (data.lastDrawDate) setLastDrawDate(data.lastDrawDate);
                    setResults(data.results.sort((a: SystemResult, b: SystemResult) => b.hits - a.hits));
                }
            } catch (e) {
                if (!cancelled) console.error('Failed to load last draw star systems', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [game]);

    if (loading) {
        return (
            <div className="rounded-xl p-4 border-2 border-accent-border bg-surface-1/60 h-full flex items-center justify-center min-h-[160px]">
                <div className="animate-spin text-accent">
                    <Star className="w-6 h-6" />
                </div>
            </div>
        );
    }

    const winners = results.filter(r => r.hits > 0);
    const perfectWinners = results.filter(r => r.hits === maxStars);

    return (
        <div className="glass-card flex flex-col p-4 gap-4 h-[420px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-b border-[var(--border-default)] pb-3 text-[var(--text-primary)]">
                <div>
                    <span className="font-semibold text-sm">{t("best_star_systems")} {starLabel} - ({lastDrawDate})</span>
                </div>
                {perfectWinners.length > 0 && (
                    <span className="shrink-0 shrink-0 px-3 py-1 rounded-full bg-accent text-white text-xs font-bold shadow-lg animate-pulse">
                        {perfectWinners.length} JACKPOTS!
                    </span>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {winners.length > 0 ? (
                    <div className="space-y-2">
                        {winners.map((result) => (
                            <Link href={`/analysis/stars/ranking/${game.toLowerCase()}/${encodeURIComponent(result.systemName)}`} key={result.systemName} className="block">
                                <div className="flex items-center justify-between rounded-full border-2 border-[var(--border-strong)] bg-transparent px-3 py-2 transition-all hover:border-[var(--text-primary)]">

                                <div className="flex items-center gap-3">
                                    <div className={`h-7 px-2 flex items-center justify-center rounded-lg text-xs font-bold shadow-sm min-w-[3rem] ${
                                        "bg-accent text-white shadow-sm"}`}>
                                        {result.hits}/{maxStars}
                                    </div>
                                    <span className="font-bold text-[var(--text-primary)]">
                                        {formatSystemName(result.systemName)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {result.hits === maxStars && (
                                        <span className="text-xs font-bold text-accent">{t('perfect')}</span>
                                    )}
                                </div>
                                                            </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Minus className="w-8 h-8 mb-3 opacity-50" />
                        <p className="text-sm">Nenhum sistema acertou {starLabel} neste sorteio.</p>
                    </div>
                )}
            </div>
        </div>
    );
}