'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getLastDrawNumberSystems } from '@/app/ranking/actions';
import { formatSystemName } from '@/utils/formatters';
import { GameType } from '@/types/game';

interface SystemResult {
    systemName: string;
    hits: number;
}

interface LastDrawNumberSystemsProps {
    game?: GameType;
}

export default function LastDrawNumberSystems({ game = GameType.EUROMILLIONS }: LastDrawNumberSystemsProps) {
    const t = useTranslations('dashboard');
    const locale = useLocale();
    const [results, setResults] = useState<SystemResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastDrawDate, setLastDrawDate] = useState<string>('');

    const maxNumbers = game === GameType.EURODREAMS ? 6 : 5;

    useEffect(() => {
        async function load() {
            try {
                const data = await getLastDrawNumberSystems(game);
                if (data.date) {
                    setLastDrawDate(data.date);
                    setResults(data.systems.sort((a, b) => b.hits - a.hits));
                }
            } catch (e) {
                console.error("Failed to load last draw number systems", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [game]);

    if (loading) {
        return (
            <div className="glass-card flex flex-col p-4 gap-4 h-[420px]" data-game={game}>
                <div className="flex items-center justify-between border-b border-border pb-3 text-[var(--accent)]">
                    <span className="font-semibold text-sm">{t("top_numbers")}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                    </div>
                </div>
            </div>
        );
    }

    const winners = results.filter(r => r.hits > 0);
    const perfectWinners = results.filter(r => r.hits === maxNumbers);

    return (
        <div className="glass-card flex flex-col p-4 gap-4 h-[420px]" data-game={game}>
            <div className="flex items-center justify-between border-b border-border pb-3 text-[var(--accent)]">
                <span className="font-semibold text-sm">{t("top_numbers")} - ({lastDrawDate})</span>
                {perfectWinners.length > 0 && (
                    <span className="ml-auto text-[10px] font-bold uppercase bg-accent text-white px-2 py-1 rounded-full animate-pulse">
                        {perfectWinners.length} JACKPOTS!
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                <div className="space-y-2">
                    {winners.length > 0 ? (
                        winners.map((result, idx) => (
                            <Link href={`/ranking/${game}/${result.systemName}`} key={result.systemName} className="block">
                                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-transparent px-3 py-2 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-7 px-2 flex items-center justify-center rounded-lg text-xs font-bold shadow-sm min-w-[3rem] ${
                                            result.hits === maxNumbers ? 'bg-accent text-white' :
                                                result.hits === (maxNumbers - 1) ? "bg-accent/20 text-accent" :
                                                    'bg-surface-2 text-muted-foreground'
                                        }`}>
                                            {result.hits}/{maxNumbers}
                                        </div>
                                        <span className="font-medium text-sm text-foreground truncate">
                                            {formatSystemName(result.systemName)}
                                        </span>
                                    </div>
                                    {result.hits === maxNumbers && (
                                        <span className="text-xs font-bold text-accent">PERFEITO!</span>
                                    )}
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Trophy className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">Nenhum sistema acertou números.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
