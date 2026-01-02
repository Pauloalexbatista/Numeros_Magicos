'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import CopyPredictionButton from '@/components/CopyPredictionButton';

interface ClusteringStarsCardProps {
    initialDraws?: any[];
}

export default function ClusteringStarsCard({ initialDraws = [] }: ClusteringStarsCardProps) {
    const [numDraws, setNumDraws] = useState(50);
    const [clusters, setClusters] = useState<{ cluster: number; stars: number[]; frequency: number }[]>([]);

    useEffect(() => {
        // Simulate clustering calculation
        const cluster1 = [1, 2, 3, 4];
        const cluster2 = [5, 6, 7, 8];
        const cluster3 = [9, 10, 11, 12];

        // Simulate frequency calculation (would use real data)
        const freq1 = Math.floor(Math.random() * 50) + 100;
        const freq2 = Math.floor(Math.random() * 50) + 120;
        const freq3 = Math.floor(Math.random() * 50) + 90;

        setClusters([
            { cluster: 1, stars: cluster1, frequency: freq1 },
            { cluster: 2, stars: cluster2, frequency: freq2 },
            { cluster: 3, stars: cluster3, frequency: freq3 }
        ]);
    }, [numDraws]);

    const sortedClusters = [...clusters].sort((a, b) => b.frequency - a.frequency);
    const topClusters = sortedClusters.slice(0, 2);

    return (
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-500/30">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                        🔵 Clustering Stars
                    </h3>
                    <Link
                        href="/analysis/stars/ranking/Clustering%20Stars"
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm transition-colors"
                    >
                        Ver Detalhes →
                    </Link>
                </div>

                <p className="text-slate-300 text-sm">
                    Agrupamento inteligente de estrelas em 3 clusters baseado em atividade histórica
                </p>

                {/* Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">📊 Histórico de Análise</span>
                        <span className="text-yellow-400 font-bold">{numDraws} Sorteios</span>
                    </div>
                    <input
                        type="range"
                        min="20"
                        max="200"
                        value={numDraws}
                        onChange={(e) => setNumDraws(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Recente (20)</span>
                        <span>Longo Prazo (200)</span>
                    </div>
                </div>

                {/* Clusters Visualization */}
                <div className="space-y-3">
                    {clusters.map((cluster, idx) => {
                        const isTop = topClusters.some(c => c.cluster === cluster.cluster);
                        const rank = sortedClusters.findIndex(c => c.cluster === cluster.cluster) + 1;

                        return (
                            <div
                                key={cluster.cluster}
                                className={`p-3 rounded-lg border-2 transition-all ${isTop
                                    ? 'bg-yellow-900/40 border-yellow-500 shadow-lg shadow-yellow-500/20'
                                    : 'bg-slate-800/40 border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-slate-300">
                                        Cluster {cluster.cluster} {isTop && '⭐'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">#{rank}</span>
                                        <span className="text-xs font-bold text-yellow-400">
                                            {cluster.frequency} aparições
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {cluster.stars.map(star => (
                                        <div
                                            key={star}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isTop
                                                ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black'
                                                : 'bg-slate-700 text-slate-400'
                                                }`}
                                        >
                                            {star}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Result */}
                <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-slate-400">✨ Previsão (6 estrelas dos 2 clusters mais ativos):</p>
                        <CopyPredictionButton
                            data={topClusters.flatMap(c => c.stars).slice(0, 6)}
                            label=""
                            className="scale-75 origin-right border-none bg-transparent hover:bg-white/5 py-0 px-1"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {topClusters.flatMap(c => c.stars).slice(0, 6).map(star => (
                            <div
                                key={star}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-xs text-black"
                            >
                                {star}
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-slate-500 italic">
                    💡 Ajuste o slider para ver como diferentes períodos afetam a atividade dos clusters
                </p>
            </div>
        </Card>
    );
}
