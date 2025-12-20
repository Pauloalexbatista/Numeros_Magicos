'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function VortexStarsCard() {
    const [depth, setDepth] = useState(5);

    // Simulate vortex pattern (circular/toroidal)
    const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const [selectedStar, setSelectedStar] = useState(6);

    // Calculate resonance pattern (wrap-around)
    const getResonanceStars = (center: number, depth: number) => {
        const resonance: number[] = [];
        for (let d = 1; d <= depth; d++) {
            // Left diagonal (wrap-around)
            let left = center - d;
            if (left < 1) left = 12 + left;
            resonance.push(left);

            // Right diagonal (wrap-around)
            let right = center + d;
            if (right > 12) right = right - 12;
            resonance.push(right);
        }
        return [...new Set(resonance)];
    };

    const resonanceStars = getResonanceStars(selectedStar, depth);

    // Calculate scores (simulated)
    const scores = stars.map(s => ({
        star: s,
        score: resonanceStars.includes(s) ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 20
    })).sort((a, b) => b.score - a.score);

    const topStars = scores.slice(0, 6);

    return (
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-500/30">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                        🌀 Vortex Stars
                    </h3>
                    <a
                        href="/analysis/stars/ranking/Vortex%20Stars"
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm transition-colors"
                    >
                        Ver Detalhes →
                    </a>
                </div>

                <p className="text-slate-300 text-sm">
                    Ressonância toroidal com padrões diagonais circulares (wrap-around)
                </p>

                {/* Depth Control */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">🔍 Profundidade de Análise</span>
                        <span className="text-yellow-400 font-bold">{depth} níveis</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={depth}
                        onChange={(e) => setDepth(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                </div>

                {/* Circular Visualization */}
                <div className="relative h-64 bg-slate-800/40 rounded-lg border border-slate-600 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Center circle */}
                        <div className="relative w-48 h-48">
                            {stars.map((star, idx) => {
                                const angle = (idx * 30) - 90; // 360/12 = 30 degrees per star
                                const radian = (angle * Math.PI) / 180;
                                const radius = 80;
                                const x = Math.cos(radian) * radius;
                                const y = Math.sin(radian) * radius;

                                const isSelected = star === selectedStar;
                                const isResonance = resonanceStars.includes(star);
                                const isTop = topStars.some(t => t.star === star);

                                return (
                                    <div
                                        key={star}
                                        className="absolute cursor-pointer transition-all"
                                        style={{
                                            left: `calc(50% + ${x}px)`,
                                            top: `calc(50% + ${y}px)`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                        onClick={() => setSelectedStar(star)}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${isSelected
                                                ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black scale-125 shadow-lg shadow-yellow-500/50'
                                                : isTop
                                                    ? 'bg-gradient-to-br from-yellow-500 to-amber-700 text-white'
                                                    : isResonance
                                                        ? 'bg-yellow-900/60 text-yellow-300 border-2 border-yellow-500'
                                                        : 'bg-slate-700 text-slate-400'
                                            }`}>
                                            {star}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Center indicator */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        </div>
                    </div>

                    <div className="absolute bottom-2 left-2 text-xs text-slate-500">
                        💡 Clique numa estrela para ver o padrão de ressonância
                    </div>
                </div>

                {/* Resonance Info */}
                <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-600">
                    <p className="text-xs text-slate-400 mb-2">
                        🌀 Padrão de Ressonância (estrela {selectedStar}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {resonanceStars.map(s => (
                            <span key={s} className="px-2 py-1 bg-yellow-900/40 text-yellow-300 rounded text-xs border border-yellow-500/30">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Top 6 Result */}
                <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-xs text-slate-400 mb-2">✨ Top 6 (maior score de ressonância):</p>
                    <div className="flex flex-wrap gap-2">
                        {topStars.map((item, idx) => (
                            <div key={item.star} className="text-center">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-sm text-black">
                                        {item.star}
                                    </div>
                                    {idx < 3 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[10px]">
                                            {idx + 1}
                                        </div>
                                    )}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">{item.score}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-slate-500 italic">
                    🔄 O padrão é circular: 1→2→...→12→1 (toroidal wrap-around)
                </p>
            </div>
        </Card>
    );
}
