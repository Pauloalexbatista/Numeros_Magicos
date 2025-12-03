'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SystemPerformance {
    id: number;
    drawId: number;
    accuracy: number;
    createdAt: string;
    draw: {
        date: string;
    };
}

export default function SystemTrendChart({ systemName }: { systemName: string }) {
    const [data, setData] = useState<SystemPerformance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/ranking/${systemName}`);
                const json = await res.json();
                // API returns newest first (desc), we want oldest first for chart (asc)
                setData(json.reverse());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [systemName]);

    if (loading) return <div className="h-64 flex items-center justify-center text-sm text-zinc-500">Carregando gráfico...</div>;
    if (data.length === 0) return <div className="h-64 flex items-center justify-center text-sm text-zinc-500">Sem dados disponíveis</div>;

    return (
        <div className="h-64 w-full bg-white dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-100 dark:border-zinc-800">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-white mb-4">Evolução da Precisão (Últimos 100 Sorteios)</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="drawId"
                        stroke="#9ca3af"
                        fontSize={10}
                        tickFormatter={(value) => `#${value}`}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={10}
                        unit="%"
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        labelFormatter={(label) => `Sorteio #${label}`}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Precisão']}
                    />
                    <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
