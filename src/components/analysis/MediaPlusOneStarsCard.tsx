'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import CopyPredictionButton from '@/components/CopyPredictionButton';

export default function MediaPlusOneStarsCard() {
    const [numDraws, setNumDraws] = useState(50);

    // Simulate averages (would use real data)
    const avgPos1 = 4;
    const avgPos2 = 9;

    const pos1Stars = [avgPos1 - 1, avgPos1, avgPos1 + 1].filter(s => s >= 1 && s <= 12);
    const pos2Stars = [avgPos2 - 1, avgPos2, avgPos2 + 1].filter(s => s >= 1 && s <= 12);

    const allStars = Array.from(new Set([...pos1Stars, ...pos2Stars])).sort((a, b) => a - b);

    return (
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-500/30">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                        📊 Média +1 Stars
                    </h3>
                    <Link
                        href="/analysis/stars/ranking/M%C3%A9dia%20%2B1%20Stars"
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm transition-colors"
                    >
                        Ver Detalhes →
                    </Link>
                </div>

                <p className="text-slate-300 text-sm">
                    Calcula média por posição e seleciona vizinhos (±1)
                </p>

                {/* Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">📈 Sorteios para Média</span>
                        <span className="text-yellow-400 font-bold">{numDraws}</span>
                    </div>
                    <input
                        type="range"
                        min="20"
                        max="100"
                        value={numDraws}
                        onChange={(e) => setNumDraws(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                </div>

                {/* Position Analysis */}
                <div className="space-y-3">
                    {/* Position 1 */}
                    <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-slate-300">1ª Posição (Estrela Menor)</span>
                            <span className="text-xs text-yellow-400">Média: {avgPos1}</span>
                        </div>

                        {/* Number line */}
                        <div className="relative h-12 bg-slate-700/50 rounded flex items-center justify-between px-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                                <div
                                    key={num}
                                    className={`relative flex flex-col items-center ${pos1Stars.includes(num) ? 'z-10' : ''
                                        }`}
                                >
                                    {pos1Stars.includes(num) && (
                                        <div className="absolute -top-8 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-xs text-black animate-bounce">
                                            {num}
                                        </div>
                                    )}
                                    <div className={`w-1 h-3 rounded ${num === avgPos1 ? 'bg-yellow-500 h-6' : 'bg-slate-600'
                                        }`} />
                                    <span className="text-[10px] text-slate-500 mt-1">{num}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-2 text-xs text-slate-400">
                            Selecionados: {pos1Stars.join(', ')} (média ±1)
                        </div>
                    </div>

                    {/* Position 2 */}
                    <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-slate-300">2ª Posição (Estrela Maior)</span>
                            <span className="text-xs text-yellow-400">Média: {avgPos2}</span>
                        </div>

                        {/* Number line */}
                        <div className="relative h-12 bg-slate-700/50 rounded flex items-center justify-between px-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                                <div
                                    key={num}
                                    className={`relative flex flex-col items-center ${pos2Stars.includes(num) ? 'z-10' : ''
                                        }`}
                                >
                                    {pos2Stars.includes(num) && (
                                        <div className="absolute -top-8 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-xs text-black animate-bounce">
                                            {num}
                                        </div>
                                    )}
                                    <div className={`w-1 h-3 rounded ${num === avgPos2 ? 'bg-yellow-500 h-6' : 'bg-slate-600'
                                        }`} />
                                    <span className="text-[10px] text-slate-500 mt-1">{num}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-2 text-xs text-slate-400">
                            Selecionados: {pos2Stars.join(', ')} (média ±1)
                        </div>
                    </div>
                </div>

                {/* Final Result */}
                <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-slate-400">✨ Previsão Final ({allStars.length} estrelas):</p>
                        <CopyPredictionButton
                            data={allStars}
                            label=""
                            className="scale-75 origin-right border-none bg-transparent hover:bg-white/5 py-0 px-1"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {allStars.map(star => (
                            <div
                                key={star}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-sm text-black"
                            >
                                {star}
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-slate-500 italic">
                    💡 Ajuste o período para ver como a média muda ao longo do tempo
                </p>
            </div>
        </Card>
    );
}
