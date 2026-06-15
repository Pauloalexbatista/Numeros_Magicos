import { useEffect, useState } from 'react';
import { getStarSuggestions } from '@/app/analysis/stars/actions';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { GameType } from '@/types/game';
import { gameTokens } from '@/styles/game-tokens';

interface RecommendedBetData {
    numbers: number[];
    stars: {
        golden: string;
        hot: string;
    };
    game: GameType;
}

interface RecommendedBetWidgetProps {
    game?: GameType;
}

export default function RecommendedBetWidget({ game = GameType.EUROMILLIONS }: RecommendedBetWidgetProps) {
    const [data, setData] = useState<RecommendedBetData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const gameParam = game ? `&game=${game}` : '';
                let numbers: number[] = [];
                let systemUsed = '';

                const rankResp = await fetch(`/api/ranking?limit=1${gameParam}`);
                const rankData = await rankResp.json();
                if (rankData.ranking && rankData.ranking.length > 0) {
                    systemUsed = rankData.ranking[0].systemName;
                    const topPredResp = await fetch(`/api/predictions/latest?system=${systemUsed}${gameParam}`);
                    const topPredData = await topPredResp.json();
                    if (topPredData.numbers) {
                        numbers = topPredData.numbers;
                    }
                }

                const starData = await getStarSuggestions(game);

                const maxNums = (game === GameType.EURODREAMS || game === GameType.MEGASENA) ? 6 : 5;

                if (numbers.length >= maxNums) {
                    setData({
                        numbers: numbers.slice(0, maxNums).sort((a: number, b: number) => a - b),
                        stars: {
                            golden: String(starData.golden.pair),
                            hot: String(starData.hot.pair)
                        },
                        game
                    });
                }
            } catch (error) {
                console.error("Failed to load recommendation:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [game]);

    if (loading) return <div className="animate-pulse h-64 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />;

    if (!data) return (
        <Card className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-sm font-medium text-muted-foreground">Aposta recomendada em carregamento...</p>
        </Card>
    );

    const formatPair = (pair: string) => pair.split('-').map(n => parseInt(n));
    const tokens = gameTokens[data.game] || gameTokens[GameType.EUROMILLIONS];

    return (
        <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-border shadow-sm backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4 pb-3">
                <h3 className="flex items-center gap-2 text-[15px] font-bold tracking-tight" style={{ color: tokens.text }}>
                    ✨ O Teu Bilhete Dourado
                </h3>
                <div className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider animate-pulse"
                    style={{ background: tokens.accentMuted, color: tokens.accent, border: `1px solid ${tokens.accentBorder}` }}>
                    A Próxima Jogada
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-center space-y-6 p-5">

                {/* Numbers */}
                <div className="space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Combinação Principal
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {data.numbers.map((n, i) => (
                            <div
                                key={n}
                                className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold shadow-lg ring-2 transition-transform hover:scale-110"
                                style={{
                                    background: tokens.gradient,
                                    color: '#fff',
                                    animationDelay: `${i * 100}ms`,
                                    boxShadow: `0 8px 30px ${tokens.accent}35`,
                                    
                                }}
                            >
                                {n}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stars Options */}
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-border p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="space-y-2">
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-[10px] font-bold uppercase tracking-widest text-transparent">
                            {data.game === GameType.EUROMILLIONS ? 'Estrelas (G)' : data.game === GameType.TOTOLOTO ? 'Sorte (G)' : 'Sonho (G)'}
                        </div>
                        <div className="flex gap-2">
                            {formatPair(data.stars.golden).map(n => (
                                <div key={`g-${n}`} className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-md ring-2 transition-transform hover:-translate-y-1"
                                    style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', boxShadow: '0 6px 24px rgba(245,158,11,0.35)' }}>
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 border-l border-border pl-4">
                        <div className="bg-gradient-to-r from-rose-500 to-red-600 bg-clip-text text-[10px] font-bold uppercase tracking-widest text-transparent">
                            {data.game === GameType.EUROMILLIONS ? 'Estrelas (H)' : data.game === GameType.TOTOLOTO ? 'Sorte (H)' : 'Sonho (H)'}
                        </div>
                        <div className="flex gap-2">
                            {formatPair(data.stars.hot).map(n => (
                                <div key={`h-${n}`} className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-md ring-2 transition-transform hover:-translate-y-1"
                                    style={{ background: 'linear-gradient(135deg, #F43F5E, #DC2626)', color: '#fff', boxShadow: '0 6px 24px rgba(244,63,94,0.35)' }}>
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </Card>
    );
}
