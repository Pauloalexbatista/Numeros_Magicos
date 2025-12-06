'use client';

import { Trophy, TrendingDown } from 'lucide-react';

interface Peak {
    year: number;
    jackpots: number;
    type: 'peak' | 'valley';
}

interface Props {
    peaks: Peak[];
    valleys: Peak[];
    cyclePattern: {
        averageGap: number;
        gaps: number[];
    };
}

export default function CycleDetectionCard({ peaks, valleys, cyclePattern }: Props) {
    return (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Análise de Ciclos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Peaks */}
                <div>
                    <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                        📈 Picos ({peaks.length})
                    </h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {peaks.map((peak, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/50"
                            >
                                <span className="text-white font-medium">{peak.year}</span>
                                <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-bold">
                                    {peak.jackpots} jackpots
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Valleys */}
                <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                        📉 Vales ({valleys.length})
                    </h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {valleys.map((valley, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-lg bg-red-950/30 border border-red-900/50"
                            >
                                <span className="text-white font-medium">{valley.year}</span>
                                <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                                    {valley.jackpots} jackpots
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cycle Pattern */}
            <div className="mt-6 p-4 rounded-lg bg-blue-950/30 border border-blue-900/50">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">⏱️ Padrão de Ciclo</h4>
                <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Intervalo médio entre picos:</span>
                    <span className="text-2xl font-bold text-blue-400">
                        {cyclePattern.averageGap} anos
                    </span>
                </div>
                {cyclePattern.gaps.length > 0 && (
                    <div className="mt-2 text-xs text-zinc-400">
                        Intervalos: {cyclePattern.gaps.join(', ')} anos
                    </div>
                )}
            </div>
        </div>
    );
}
