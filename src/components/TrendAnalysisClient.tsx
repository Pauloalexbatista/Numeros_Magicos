'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendData } from '@/services/trend-analysis';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface TrendAnalysisClientProps {
    trends: TrendData[];
    windowSize: number;
    type: 'numbers' | 'stars';
}

export default function TrendAnalysisClient({ trends, windowSize, type }: TrendAnalysisClientProps) {
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
    const [filter, setFilter] = useState<'all' | 'up' | 'down' | 'stable'>('all');

    const selectedTrend = trends.find(t => t.number === selectedNumber);

    const filteredTrends = trends.filter(t => {
        if (filter === 'all') return true;
        return t.trend === filter;
    });

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <Minus className="w-4 h-4 text-gray-600" />;
    };

    const getTrendColor = (trend: TrendData) => {
        if (trend.trend === 'up') return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
        if (trend.trend === 'down') return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
        return 'bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700';
    };

    const getVolatilityBadge = (volatility: 'stable' | 'moderate' | 'erratic') => {
        if (volatility === 'stable') return <span className="px-2 py-1 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">🟢 Estável</span>;
        if (volatility === 'moderate') return <span className="px-2 py-1 rounded text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">🟡 Moderado</span>;
        return <span className="px-2 py-1 rounded text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">🔴 Errático</span>;
    };

    const maxNumber = type === 'numbers' ? 50 : 12;
    const itemName = type === 'numbers' ? 'Número' : 'Estrela';

    // Função para gerar interpretação clara (sem contradições)
    const getInterpretation = (trend: TrendData) => {
        const totalCount = trend.frequencies.reduce((sum, f) => sum + f.count, 0);
        const expected = (trend.expectedFrequency / 100 * 50);

        // Prioridade 1: Tendência forte
        if (trend.trend === 'up') {
            return {
                color: 'green',
                title: '📈 Tendência de Subida',
                message: `Está a aparecer cada vez mais nos sorteios recentes. ${trend.compensation > 1
                        ? 'Além disso, está abaixo da média histórica, o que reforça a probabilidade de continuar a sair.'
                        : trend.compensation < -1
                            ? 'No entanto, já está acima da média histórica, por isso pode começar a compensar em breve.'
                            : 'Comportamento interessante para acompanhar.'
                    }`
            };
        }

        if (trend.trend === 'down') {
            return {
                color: 'red',
                title: '📉 Tendência de Descida',
                message: `Está a aparecer cada vez menos nos sorteios recentes. ${trend.compensation > 1
                        ? 'Mas como está abaixo da média histórica, pode compensar e voltar a subir.'
                        : trend.compensation < -1
                            ? 'E já está acima da média histórica, por isso a tendência de descida faz sentido.'
                            : 'Pode estar a entrar numa fase mais fria.'
                    }`
            };
        }

        // Prioridade 2: Se não há tendência, mostrar compensação
        if (trend.compensation > 1) {
            return {
                color: 'green',
                title: '✅ Abaixo da Média',
                message: `Este ${type === 'numbers' ? 'número' : 'estrela'} saiu menos do que seria esperado (${totalCount} vs ~${expected.toFixed(1)} aparições). Estatisticamente, há maior probabilidade de "compensar" e aparecer mais nos próximos sorteios.`
            };
        }

        if (trend.compensation < -1) {
            return {
                color: 'orange',
                title: '⚠️ Acima da Média',
                message: `Este ${type === 'numbers' ? 'número' : 'estrela'} saiu mais do que seria esperado (${totalCount} vs ~${expected.toFixed(1)} aparições). Pode entrar numa fase de "compensação" e aparecer menos nos próximos sorteios.`
            };
        }

        // Comportamento normal
        return {
            color: 'gray',
            title: '➡️ Comportamento Normal',
            message: `Este ${type === 'numbers' ? 'número' : 'estrela'} está a sair conforme esperado (${totalCount} vs ~${expected.toFixed(1)} aparições). Comportamento estável e previsível.`
        };
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="rounded-2xl border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-green-500 text-white">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
                            📈 Como Funciona a Análise de Tendências?
                        </h3>
                        <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                            Mostra como os {type === 'numbers' ? 'números' : 'estrelas'} evoluem ao longo do tempo, identificando padrões de <strong>subida</strong>, <strong>descida</strong> ou <strong>estabilidade</strong>.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <strong className="text-green-600 dark:text-green-400">↗️ Tendência:</strong> Direção do movimento (subida/descida)
                            </div>
                            <div>
                                <strong className="text-green-600 dark:text-green-400">🎯 Volatilidade:</strong> Estável vs Errático
                            </div>
                            <div>
                                <strong className="text-green-600 dark:text-green-400">🔮 Compensação:</strong> "Dívida" estatística
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                        }`}
                >
                    Todos ({trends.length})
                </button>
                <button
                    onClick={() => setFilter('up')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'up'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                        }`}
                >
                    ↗️ Subida ({trends.filter(t => t.trend === 'up').length})
                </button>
                <button
                    onClick={() => setFilter('down')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'down'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                        }`}
                >
                    ↘️ Descida ({trends.filter(t => t.trend === 'down').length})
                </button>
                <button
                    onClick={() => setFilter('stable')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'stable'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                        }`}
                >
                    ➡️ Estável ({trends.filter(t => t.trend === 'stable').length})
                </button>
            </div>

            {/* Gráfico Detalhado (se selecionado) */}
            {selectedTrend && (
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-green-200 dark:border-green-800 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold">{itemName} {selectedNumber}</h3>
                        <button
                            onClick={() => setSelectedNumber(null)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Tendência</div>
                            <div className="flex items-center gap-2 text-xl font-bold">
                                {getTrendIcon(selectedTrend.trend)}
                                <span className="capitalize">{selectedTrend.trend === 'up' ? 'Subida' : selectedTrend.trend === 'down' ? 'Descida' : 'Estável'}</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                            <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Volatilidade</div>
                            <div className="text-xl font-bold">
                                {getVolatilityBadge(selectedTrend.volatility)}
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                            <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">Compensação</div>
                            <div className="text-xl font-bold">
                                {selectedTrend.compensation > 0 ? '+' : ''}{selectedTrend.compensation.toFixed(1)}
                            </div>
                            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                {selectedTrend.compensation > 0 ? 'Abaixo da média' : selectedTrend.compensation < 0 ? 'Acima da média' : 'Na média'}
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Freq. Atual</div>
                            <div className="text-xl font-bold">{selectedTrend.currentFrequency.toFixed(1)}%</div>
                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Esperado: {selectedTrend.expectedFrequency.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Interpretação Simplificada */}
                    {(() => {
                        const interpretation = getInterpretation(selectedTrend);
                        const colorClasses = {
                            green: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
                            red: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
                            orange: 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
                            gray: 'bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                        };

                        return (
                            <div className={`mb-6 p-4 rounded-lg border-2 ${colorClasses[interpretation.color as keyof typeof colorClasses]}`}>
                                <h4 className="font-bold mb-2">💡 {interpretation.title}</h4>
                                <p className="text-sm">{interpretation.message}</p>

                                {/* Histórico */}
                                <div className="mt-4 pt-4 border-t border-current opacity-50">
                                    <div className="text-xs font-semibold mb-2">📊 Nos últimos 50 sorteios:</div>
                                    <div className="grid grid-cols-5 gap-2 text-xs">
                                        {selectedTrend.frequencies.map((f, i) => (
                                            <div key={i} className="text-center">
                                                <div className="opacity-70">Sorteios {(i * 10) + 1}-{(i + 1) * 10}</div>
                                                <div className="font-bold text-base">{f.count}x</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Aviso */}
                                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-400">
                                    ⚠️ <strong>Importante:</strong> Cada sorteio é independente. Estas análises são baseadas em padrões históricos e não garantem resultados futuros.
                                </div>
                            </div>
                        );
                    })()}

                    {/* Gráfico */}
                    <div>
                        <h4 className="font-bold mb-3">📊 Evolução da Frequência</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={selectedTrend.frequencies.map((f, i) => ({
                                ...f,
                                sorteioNumber: (i + 1) * 10
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                <XAxis
                                    dataKey="sorteioNumber"
                                    label={{ value: 'Sorteios', position: 'insideBottom', offset: -5 }}
                                    stroke="#9ca3af"
                                    tick={{ fontSize: 12 }}
                                    domain={[0, 50]}
                                    ticks={[0, 10, 20, 30, 40, 50]}
                                />
                                <YAxis
                                    label={{ value: 'Nº de Aparições', angle: -90, position: 'insideLeft' }}
                                    stroke="#9ca3af"
                                    domain={[0, 'auto']}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#f3f4f6' }}
                                    formatter={(value: any, name: string, props: any) => {
                                        const count = props.payload.count;
                                        return [`${count} ${count === 1 ? 'vez' : 'vezes'}`, 'Aparições'];
                                    }}
                                    labelFormatter={(label) => `Até sorteio ${label}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        {/* Timeline labels */}
                        <div className="flex justify-between mt-2 px-12 text-sm text-gray-600 dark:text-gray-400">
                            <div className="text-left">← Mais antigo</div>
                            <div className="text-right">Mais recente →</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid de Números/Estrelas */}
            <div>
                <h3 className="text-xl font-bold mb-4">
                    Clique num {type === 'numbers' ? 'número' : 'estrela'} para ver detalhes
                </h3>
                <div className={`grid gap-3 ${type === 'numbers' ? 'grid-cols-5 md:grid-cols-10' : 'grid-cols-4 md:grid-cols-6'}`}>
                    {filteredTrends.map(trend => (
                        <button
                            key={trend.number}
                            onClick={() => setSelectedNumber(trend.number)}
                            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${getTrendColor(trend)} ${selectedNumber === trend.number ? 'ring-4 ring-green-500' : ''
                                }`}
                        >
                            <div className="text-2xl font-bold mb-1">{trend.number}</div>
                            <div className="flex items-center justify-center mb-1">
                                {getTrendIcon(trend.trend)}
                            </div>
                            <div className="text-xs">{getVolatilityBadge(trend.volatility)}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
