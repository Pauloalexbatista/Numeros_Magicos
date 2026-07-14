import React from 'react';
import { Flame, ThermometerSun, Snowflake, Clock, Activity, Target } from 'lucide-react';

interface PrizeRecoveryStats {
    currentStreak: number;
    averageDrawsBetween: number;
    maxDrawsBetween: number;
    status: 'hot' | 'warming' | 'cold';
}

interface RecoveryStats {
    jackpot: PrizeRecoveryStats;
    highPrize: PrizeRecoveryStats;
}

export default function RecoveryStatsCard({ stats }: { stats: RecoveryStats }) {
    
    const renderPrizeSection = (prizeStats: PrizeRecoveryStats, title: string, isJackpot: boolean) => {
        const { currentStreak, averageDrawsBetween, maxDrawsBetween, status } = prizeStats;

        const progressPercentage = averageDrawsBetween > 0 
            ? Math.min(100, (currentStreak / averageDrawsBetween) * 100)
            : 0;

        let statusConfig = {
            label: 'Desconhecido',
            color: 'text-zinc-400',
            bg: 'bg-zinc-900',
            border: 'border-zinc-800',
            icon: <Activity className="w-5 h-5 text-zinc-400" />,
            message: 'A analisar dados...'
        };

        if (status === 'hot') {
            statusConfig = {
                label: 'Pico Iminente',
                color: 'text-red-400',
                bg: 'bg-red-950/40',
                border: 'border-red-800/50',
                icon: <Flame className="w-5 h-5 text-red-500 animate-pulse" />,
                message: `Ultrapassou a média histórica de ${averageDrawsBetween} sorteios.`
            };
        } else if (status === 'warming') {
            statusConfig = {
                label: 'A Reaquecer',
                color: 'text-yellow-400',
                bg: 'bg-yellow-950/40',
                border: 'border-yellow-800/50',
                icon: <ThermometerSun className="w-5 h-5 text-yellow-500" />,
                message: `Aproxima-se da média histórica de ${averageDrawsBetween} sorteios.`
            };
        } else if (status === 'cold') {
            statusConfig = {
                label: 'Frio',
                color: 'text-blue-400',
                bg: 'bg-blue-950/40',
                border: 'border-blue-800/50',
                icon: <Snowflake className="w-5 h-5 text-blue-500" />,
                message: `Abaixo da média histórica de ${averageDrawsBetween} sorteios.`
            };
        }

        return (
            <div className={`p-4 rounded-xl border ${statusConfig.border} bg-zinc-950/50 flex flex-col gap-4 relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${status === 'hot' ? 'bg-red-500' : status === 'warming' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                
                <div className="flex justify-between items-start pl-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {isJackpot ? <Target className="w-4 h-4 text-emerald-400" /> : <Target className="w-4 h-4 text-blue-400" />}
                            <h4 className="font-bold text-white">{title}</h4>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            {statusConfig.icon}
                            <span className={`font-bold ${statusConfig.color}`}>{statusConfig.label}</span>
                        </div>
                        <p className="text-zinc-400 text-xs mt-1">{statusConfig.message}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 text-right">
                        <div className="bg-zinc-900 rounded p-2 border border-zinc-800 w-28">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Seca Atual</div>
                            <div className="font-bold text-white">{currentStreak} <span className="text-xs font-normal text-zinc-500">sorteios</span></div>
                        </div>
                        <div className="bg-zinc-900 rounded p-2 border border-zinc-800 w-28">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Maior Seca</div>
                            <div className="font-bold text-white">{maxDrawsBetween} <span className="text-xs font-normal text-zinc-500">sorteios</span></div>
                        </div>
                    </div>
                </div>

                <div className="pl-2">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-xs text-zinc-500">Progresso até média ({averageDrawsBetween})</span>
                        <span className="text-xs text-zinc-400 font-medium">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-1000 ${
                                status === 'hot' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                                status === 'warming' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="mb-6 flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                    <Activity className="w-5 h-5 text-red-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Estado de Recuperação</h3>
                    <p className="text-sm text-zinc-400">Análise de secas e tempos médios para os prémios de topo.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderPrizeSection(stats.jackpot, '1º Prémio (Jackpot)', true)}
                {renderPrizeSection(stats.highPrize, '2º Prémio (Alto)', false)}
            </div>
        </div>
    );
}

