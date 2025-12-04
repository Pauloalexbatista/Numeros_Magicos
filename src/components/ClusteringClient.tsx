'use client';

import { useState, useEffect } from 'react';
import { extractFeatures, kMeans, findOptimalK, dbscan, DataPoint, ClusterResult, ElbowResult } from '@/services/clustering';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';
import BackButton from '@/components/ui/BackButton';

interface Props {
    history: any[]; // Serialized draws
}

export default function ClusteringClient({ history }: Props) {
    const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
    const [elbowData, setElbowData] = useState<ElbowResult[]>([]);
    const [clusterResult, setClusterResult] = useState<ClusterResult | null>(null);
    const [k, setK] = useState(3);
    const [algo, setAlgo] = useState<'kmeans' | 'dbscan'>('kmeans');
    const [isProcessing, setIsProcessing] = useState(false);

    // Feature mapping for visualization
    // 0: Sum, 1: EvenCount, 2: HighCount
    const [xAxis, setXAxis] = useState(0);
    const [yAxis, setYAxis] = useState(1);

    useEffect(() => {
        // Prepare data on load
        const points = history.map((d, i) => extractFeatures(d, i));
        setDataPoints(points);
    }, [history]);

    const runElbow = () => {
        setIsProcessing(true);
        setTimeout(() => {
            const results = findOptimalK(dataPoints);
            setElbowData(results);
            setIsProcessing(false);
        }, 100);
    };

    const runClustering = () => {
        setIsProcessing(true);
        setTimeout(() => {
            let res: ClusterResult;
            // Normalize for processing
            if (algo === 'kmeans') {
                const rawPoints = history.map((d, i) => extractFeatures(d, i));
                res = kMeans(rawPoints, k);
            } else {
                const rawPoints = history.map((d, i) => extractFeatures(d, i));
                res = dbscan(rawPoints, 0.15, 5); // Hardcoded params for now
            }

            const originalWithClusters = dataPoints.map((p, i) => ({
                ...p,
                cluster: res.points[i].cluster,
                label: res.points[i].label
            }));

            setClusterResult({
                ...res,
                points: originalWithClusters
            });

            setIsProcessing(false);
        }, 100);
    };

    const renderScatterPlot = () => {
        if (!clusterResult) return null;

        const width = 600;
        const height = 400;
        const padding = 40;

        // Get min/max for scaling
        const xValues = clusterResult.points.map(p => p.features[xAxis]);
        const yValues = clusterResult.points.map(p => p.features[yAxis]);

        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);

        const xScale = (val: number) => padding + ((val - xMin) / (xMax - xMin)) * (width - 2 * padding);
        const yScale = (val: number) => height - padding - ((val - yMin) / (yMax - yMin)) * (height - 2 * padding);

        // Colors for clusters
        const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#64748b'];

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {/* Axes */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeOpacity="0.2" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" strokeOpacity="0.2" />

                {/* Points */}
                {clusterResult.points.map((p, i) => (
                    <circle
                        key={i}
                        cx={xScale(p.features[xAxis])}
                        cy={yScale(p.features[yAxis])}
                        r={i === 0 ? 6 : 3} // Highlight latest draw (index 0)
                        fill={p.cluster !== undefined && p.cluster >= 0 ? colors[p.cluster % colors.length] : '#9ca3af'}
                        opacity={0.6}
                        stroke={i === 0 ? 'black' : 'none'}
                        strokeWidth={2}
                    >
                        <title>
                            {`Draw #${p.id}\nSum: ${p.features[0]}\nEvens: ${p.features[1]}\nHighs: ${p.features[2]}\nCluster: ${p.cluster}`}
                        </title>
                    </circle>
                ))}

                {/* Labels */}
                <text x={width / 2} y={height - 5} textAnchor="middle" fontSize="12" fill="currentColor">
                    {xAxis === 0 ? 'Soma' : xAxis === 1 ? 'Pares' : 'Altos (>25)'}
                </text>
                <text x={10} y={height / 2} textAnchor="middle" transform={`rotate(-90, 10, ${height / 2})`} fontSize="12" fill="currentColor">
                    {yAxis === 0 ? 'Soma' : yAxis === 1 ? 'Pares' : 'Altos (>25)'}
                </text>
            </svg>
        );
    };

    const [showLogic, setShowLogic] = useState(false);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800 pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <span>🧩</span> K-Means Clustering
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                            Agrupamento de sorteios similares para identificar padrões ocultos.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowLogic(!showLogic)}
                        className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                        {showLogic ? '📊 Ver Análise' : '📖 Ver Lógica'}
                    </button>
                </div>
            </div>

            {/* Logic Explanation */}
            {showLogic && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <h2 className="text-2xl font-bold mb-4 text-indigo-900 dark:text-indigo-100">
                        📖 Lógica do K-Means Clustering
                    </h2>
                    <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
                        <p>
                            O <strong>K-Means</strong> é um algoritmo de inteligência artificial que agrupa dados semelhantes.
                            Neste caso, ele analisa todos os sorteios passados e tenta encontrar "famílias" de sorteios.
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>
                                <strong>Eixo X (Altos):</strong> Quantos números acima de 25 saíram no sorteio.
                            </li>
                            <li>
                                <strong>Eixo Y (Pares):</strong> Quantos números pares saíram no sorteio.
                            </li>
                            <li>
                                <strong>Clusters (Cores):</strong> Grupos de sorteios que partilham características matemáticas semelhantes.
                            </li>
                        </ul>
                        <p>
                            <strong>Como usar?</strong><br />
                            1. Clique em "Analisar Melhor K" para o sistema sugerir o número ideal de grupos.<br />
                            2. Execute o Clustering.<br />
                            3. Veja onde o <strong>último sorteio</strong> (ponto maior) se encaixa. Se ele estiver num cluster "raro", o próximo sorteio tende a voltar ao "normal" (regressão à média).
                        </p>
                    </div>
                </div>
            )}

            {!showLogic && (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <h3 className="font-bold mb-4">1. Algoritmo</h3>
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setAlgo('kmeans')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${algo === 'kmeans' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'
                                        }`}
                                >
                                    K-Means
                                </button>
                                <button
                                    onClick={() => setAlgo('dbscan')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${algo === 'dbscan' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'
                                        }`}
                                >
                                    DBSCAN
                                </button>
                            </div>

                            {algo === 'kmeans' && (
                                <div className="mb-4">
                                    <label className="block text-sm text-zinc-500 mb-1">Número de Clusters (K)</label>
                                    <input
                                        type="range"
                                        min="2"
                                        max="10"
                                        value={k}
                                        onChange={(e) => setK(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="text-center font-mono font-bold">{k}</div>
                                </div>
                            )}

                            <button
                                onClick={runClustering}
                                disabled={isProcessing}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white font-bold rounded-lg transition-all"
                            >
                                {isProcessing ? 'A Processar...' : 'Executar Clustering'}
                            </button>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <h3 className="font-bold mb-4">2. Análise K Ideal</h3>
                            <p className="text-sm text-zinc-500 mb-4">
                                Use o "Elbow Method" para encontrar o número ideal de clusters. Procure o ponto onde a curva "dobra".
                            </p>
                            <button
                                onClick={runElbow}
                                disabled={isProcessing}
                                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-all text-sm"
                            >
                                {isProcessing ? 'A Calcular...' : 'Analisar Melhor K'}
                            </button>

                            {elbowData.length > 0 && (
                                <div className="mt-6 space-y-4">
                                    {/* Simple Recommendation */}
                                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 font-bold">
                                                {(() => {
                                                    // Calculate Optimal K (Max distance from line)
                                                    const p1 = { x: elbowData[0].k, y: elbowData[0].wcss };
                                                    const p2 = { x: elbowData[elbowData.length - 1].k, y: elbowData[elbowData.length - 1].wcss };
                                                    let maxDist = 0;
                                                    let bestK = elbowData[0].k;
                                                    const A = p1.y - p2.y;
                                                    const B = p2.x - p1.x;
                                                    const C = p1.x * p2.y - p2.x * p1.y;
                                                    const denominator = Math.sqrt(A * A + B * B);

                                                    elbowData.forEach(p => {
                                                        const dist = Math.abs(A * p.k + B * p.wcss + C) / denominator;
                                                        if (dist > maxDist) {
                                                            maxDist = dist;
                                                            bestK = p.k;
                                                        }
                                                    });
                                                    return bestK;
                                                })()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-indigo-900 dark:text-indigo-100">Recomendação</h4>
                                                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                                    O número ideal de clusters parece ser este.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setK((() => {
                                                const p1 = { x: elbowData[0].k, y: elbowData[0].wcss };
                                                const p2 = { x: elbowData[elbowData.length - 1].k, y: elbowData[elbowData.length - 1].wcss };
                                                let maxDist = 0;
                                                let bestK = elbowData[0].k;
                                                const A = p1.y - p2.y;
                                                const B = p2.x - p1.x;
                                                const C = p1.x * p2.y - p2.x * p1.y;
                                                const denominator = Math.sqrt(A * A + B * B);
                                                elbowData.forEach(p => {
                                                    const dist = Math.abs(A * p.k + B * p.wcss + C) / denominator;
                                                    if (dist > maxDist) { maxDist = dist; bestK = p.k; }
                                                });
                                                return bestK;
                                            })())}
                                            className="text-xs underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                                        >
                                            Aplicar K={(() => {
                                                const p1 = { x: elbowData[0].k, y: elbowData[0].wcss };
                                                const p2 = { x: elbowData[elbowData.length - 1].k, y: elbowData[elbowData.length - 1].wcss };
                                                let maxDist = 0;
                                                let bestK = elbowData[0].k;
                                                const A = p1.y - p2.y;
                                                const B = p2.x - p1.x;
                                                const C = p1.x * p2.y - p2.x * p1.y;
                                                const denominator = Math.sqrt(A * A + B * B);
                                                elbowData.forEach(p => {
                                                    const dist = Math.abs(A * p.k + B * p.wcss + C) / denominator;
                                                    if (dist > maxDist) { maxDist = dist; bestK = p.k; }
                                                });
                                                return bestK;
                                            })()}
                                        </button>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <p className="text-xs text-zinc-400 mb-2">Detalhes Técnicos (Curva Elbow)</p>
                                        <div className="h-24 opacity-70 hover:opacity-100 transition-opacity">
                                            {/* Mini Elbow Chart */}
                                            <svg viewBox="0 0 100 50" className="w-full h-full">
                                                <polyline
                                                    points={elbowData.map((d, i) => {
                                                        const maxWcss = elbowData[0].wcss;
                                                        const x = (i / (elbowData.length - 1)) * 100;
                                                        const y = 35 - (d.wcss / maxWcss) * 35; // Use top 35px
                                                        return `${x},${y}`;
                                                    }).join(' ')}
                                                    fill="none"
                                                    stroke="#6366f1"
                                                    strokeWidth="2"
                                                />
                                                {elbowData.map((d, i) => {
                                                    const x = (i / (elbowData.length - 1)) * 100;
                                                    return (
                                                        <text
                                                            key={d.k}
                                                            x={x}
                                                            y="48"
                                                            textAnchor="middle"
                                                            fontSize="8"
                                                            fill="currentColor"
                                                            className="text-zinc-500 dark:text-zinc-400"
                                                        >
                                                            {d.k}
                                                        </text>
                                                    );
                                                })}
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Visualization */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-end gap-4">
                            <select
                                value={xAxis}
                                onChange={(e) => setXAxis(parseInt(e.target.value))}
                                className="bg-transparent border border-zinc-200 dark:border-zinc-700 rounded p-1 text-sm"
                            >
                                <option value={0}>Eixo X: Soma</option>
                                <option value={1}>Eixo X: Pares</option>
                                <option value={2}>Eixo X: Altos</option>
                            </select>
                            <select
                                value={yAxis}
                                onChange={(e) => setYAxis(parseInt(e.target.value))}
                                className="bg-transparent border border-zinc-200 dark:border-zinc-700 rounded p-1 text-sm"
                            >
                                <option value={0}>Eixo Y: Soma</option>
                                <option value={1}>Eixo Y: Pares</option>
                                <option value={2}>Eixo Y: Altos</option>
                            </select>
                        </div>

                        <div className="aspect-video">
                            {clusterResult ? renderScatterPlot() : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400">
                                    Execute o clustering para visualizar
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        {clusterResult && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array.from({ length: clusterResult.k }).map((_, i) => {
                                    const points = clusterResult.points.filter(p => p.cluster === i);
                                    const count = points.length;
                                    const percentage = ((count / clusterResult.points.length) * 100).toFixed(1);

                                    // Calculate averages for interpretation
                                    const avgSum = points.reduce((acc, p) => acc + p.features[0], 0) / count;
                                    const avgEvens = points.reduce((acc, p) => acc + p.features[1], 0) / count;
                                    const avgHighs = points.reduce((acc, p) => acc + p.features[2], 0) / count;

                                    let desc = [];
                                    if (avgSum < 140) desc.push('Soma Baixa');
                                    else if (avgSum > 180) desc.push('Soma Alta');
                                    else desc.push('Soma Média');

                                    if (avgEvens < 2.3) desc.push('Poucos Pares');
                                    else if (avgEvens > 2.7) desc.push('Muitos Pares');
                                    else desc.push('Pares Equilibrados');

                                    if (avgHighs < 2.3) desc.push('Poucos Altos');
                                    else if (avgHighs > 2.7) desc.push('Muitos Altos');
                                    else desc.push('Altos Equilibrados');

                                    return (
                                        <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="text-xs font-bold uppercase text-zinc-500">Cluster {i + 1}</div>
                                                    <div className="text-xs font-mono bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-zinc-600 dark:text-zinc-300">
                                                        {percentage}%
                                                    </div>
                                                </div>
                                                <div className="text-2xl font-bold mb-1">{count} <span className="text-sm font-normal text-zinc-400">sorteios</span></div>
                                                <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                    {desc.join(' • ')}
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 grid grid-cols-3 gap-2 text-xs text-zinc-500 text-center">
                                                <div>
                                                    <div className="font-bold text-zinc-700 dark:text-zinc-300">{Math.round(avgSum)}</div>
                                                    <div>Soma</div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-700 dark:text-zinc-300">{avgEvens.toFixed(1)}</div>
                                                    <div>Pares</div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-700 dark:text-zinc-300">{avgHighs.toFixed(1)}</div>
                                                    <div>Altos</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <ResponsibleGamingFooter />
        </div>
    );
}
