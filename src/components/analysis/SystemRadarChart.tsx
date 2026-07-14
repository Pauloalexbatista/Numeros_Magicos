'use client';

﻿import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarStats {
    consistency: number;
    frequency: number;
    resilience: number;
    power: number;
}

export default function SystemRadarChart({ stats, systemName }: { stats: RadarStats, systemName: string }) {
    const data = {
        labels: ['Consistência', 'Frequência (Jackpots)', 'Poder (Prémios Altos)', 'Resiliência'],
        datasets: [
            {
                label: `Perfil de ${systemName}`,
                data: [stats.consistency, stats.frequency, stats.power, stats.resilience],
                backgroundColor: 'rgba(16, 185, 129, 0.2)', // emerald-500/20
                borderColor: 'rgba(16, 185, 129, 1)', // emerald-500
                borderWidth: 2,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                pointLabels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: {
                        size: 12,
                        family: 'Inter, sans-serif'
                    }
                },
                ticks: {
                    display: false,
                    min: 0,
                    max: 100,
                    stepSize: 20
                }
            },
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            }
        },
    };

    return (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 h-full flex flex-col items-center">
            <h3 className="text-xl font-bold text-white mb-6 w-full text-left">Radar de Perfil</h3>
            <div className="w-full h-64 relative">
                <Radar data={data} options={options as any} />
            </div>
            <div className="mt-6 text-sm text-zinc-400 text-center">
                Avaliação de 0 a 100 baseada no histórico comparativo.
            </div>
        </div>
    );
}

