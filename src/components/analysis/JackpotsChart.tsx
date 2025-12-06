'use client';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface YearlyData {
    year: number;
    jackpots: number;
    highPrizes: number;
    avgHits: number;
}

interface Peak {
    year: number;
    jackpots: number;
    type: 'peak' | 'valley';
}

interface Props {
    yearlyData: YearlyData[];
    peaks: Peak[];
    valleys: Peak[];
    systemName: string;
}

export default function JackpotsChart({ yearlyData, peaks, valleys, systemName }: Props) {
    const data = {
        labels: yearlyData.map(d => d.year.toString()),
        datasets: [
            {
                label: 'Jackpots (5/5)',
                data: yearlyData.map(d => d.jackpots),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: yearlyData.map(d => {
                    const isPeak = peaks.some(p => p.year === d.year);
                    const isValley = valleys.some(v => v.year === d.year);
                    return isPeak || isValley ? 8 : 4;
                }),
                pointBackgroundColor: yearlyData.map(d => {
                    const isPeak = peaks.some(p => p.year === d.year);
                    const isValley = valleys.some(v => v.year === d.year);
                    if (isPeak) return 'rgb(34, 197, 94)';
                    if (isValley) return 'rgb(239, 68, 68)';
                    return 'rgb(34, 197, 94)';
                }),
                pointBorderColor: yearlyData.map(d => {
                    const isPeak = peaks.some(p => p.year === d.year);
                    const isValley = valleys.some(v => v.year === d.year);
                    if (isPeak) return 'rgb(22, 163, 74)';
                    if (isValley) return 'rgb(220, 38, 38)';
                    return 'rgb(22, 163, 74)';
                }),
                pointBorderWidth: 2
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: {
                    color: 'rgb(156, 163, 175)',
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: `${systemName} - Jackpots por Ano (2004-2025)`,
                color: 'rgb(229, 231, 235)',
                font: {
                    size: 16,
                    weight: 'bold' as const
                }
            },
            tooltip: {
                callbacks: {
                    afterLabel: function (context: any) {
                        const year = yearlyData[context.dataIndex].year;
                        const isPeak = peaks.some(p => p.year === year);
                        const isValley = valleys.some(v => v.year === year);

                        if (isPeak) return '📈 PICO';
                        if (isValley) return '📉 VALE';
                        return '';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'rgb(156, 163, 175)',
                    stepSize: 1
                },
                grid: {
                    color: 'rgba(75, 85, 99, 0.3)'
                }
            },
            x: {
                ticks: {
                    color: 'rgb(156, 163, 175)'
                },
                grid: {
                    color: 'rgba(75, 85, 99, 0.3)'
                }
            }
        }
    };

    return (
        <div className="w-full h-[400px] bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <Line data={data} options={options} />
        </div>
    );
}
