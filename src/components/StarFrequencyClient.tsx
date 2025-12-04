
'use client';

import { Card } from '@/components/ui/card';

interface StarFrequencyClientProps {
    frequency: Record<number, number>;
    totalDraws: number;
}

export function StarFrequencyClient({ frequency, totalDraws }: StarFrequencyClientProps) {
    const maxFreq = Math.max(...Object.values(frequency));
    const stars = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <Card className="p-6 bg-slate-900/60 border-slate-800 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                📊 Frequência das Estrelas
            </h2>
            <p className="text-slate-400 text-sm mb-6">
                Quantas vezes cada estrela saiu nos últimos {totalDraws} sorteios.
            </p>

            <div className="grid grid-cols-12 gap-2 h-48 items-end">
                {stars.map(star => {
                    const count = frequency[star] || 0;
                    const heightPct = (count / maxFreq) * 100;
                    const isHot = count > maxFreq * 0.8;
                    const isCold = count < maxFreq * 0.3;

                    return (
                        <div key={star} className="flex flex-col items-center gap-2 h-full justify-end group">
                            <div className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                {count}
                            </div>
                            <div
                                className={`w-full rounded-t-sm transition-all duration-500 relative
                                    ${isHot ? 'bg-gradient-to-t from-red-600 to-red-400' :
                                        isCold ? 'bg-gradient-to-t from-blue-600 to-blue-400' :
                                            'bg-gradient-to-t from-slate-600 to-slate-400'}
                                `}
                                style={{ height: `${heightPct}%` }}
                            >
                                {isHot && (
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                )}
                            </div>
                            <div className="text-sm font-bold text-slate-300">
                                {star}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center gap-6 mt-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-sm" /> Quente ({'>'}80%)
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-500 rounded-sm" /> Normal
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm" /> Frio ({'<'}30%)
                </div>
            </div>
        </Card>
    );
}
