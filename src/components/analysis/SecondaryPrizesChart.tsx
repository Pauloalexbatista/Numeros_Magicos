'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface YearlyStats {
    year: number;
    jackpots: number;
    highPrizes: number;
}

export default function SecondaryPrizesChart({ data }: { data: YearlyStats[] }) {
    const chartData = {
        labels: data.map(d => d.year.toString()),
        datasets: [
            {
                label: 'Jackpots (Prémio Máximo)',
                data: data.map(d => d.jackpots),
                backgroundColor: 'rgba(16, 185, 129, 0.8)', // emerald
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                stack: 'Stack 0',
            },
            {
                label: 'Prémios Altos (N-1)',
                data: data.map(d => d.highPrizes),
                backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                stack: 'Stack 0',
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)'
                }
            },
            y: {
                stacked: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    stepSize: 1
                }
            }
        }
    };

    return (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 h-full">
            <h3 className="text-xl font-bold text-white mb-2">Consistência de Prémios</h3>
            <p className="text-sm text-zinc-400 mb-6">Volume de Jackpots vs Acertos Altos (N-1)</p>
            <div className="w-full h-64">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}

