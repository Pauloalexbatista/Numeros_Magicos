'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Database, TrendingUp, Activity, BarChart3 } from 'lucide-react';

export default function ProbabilityLabPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState<string>('');

    const handleExport = () => {
        setIsExporting(true);
        setExportStatus('Iniciando download...');

        try {
            // Direct download from public folder
            const link = document.createElement('a');
            link.href = '/probability-analysis-latest.xlsx';
            link.download = `probability-analysis-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setExportStatus('✅ Download iniciado!');
        } catch (error) {
            console.error('❌ Export error:', error);
            setExportStatus(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        } finally {
            setIsExporting(false);
            setTimeout(() => setExportStatus(''), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="space-y-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Voltar ao Laboratório
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 shadow-lg shadow-pink-900/20">
                            <TrendingUp className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                Laboratório de Probabilidades
                            </h1>
                            <p className="text-slate-400 text-lg mt-2">
                                Análise estatística profunda de 1902 sorteios
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Database className="w-5 h-5 text-blue-400" />
                            <h3 className="text-sm font-semibold text-slate-400">Total de Sorteios</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">1,902</p>
                        <p className="text-xs text-slate-500 mt-1">2004-02-13 a 2025-12-12</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-5 h-5 text-green-400" />
                            <h3 className="text-sm font-semibold text-slate-400">Tabelas Criadas</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">6</p>
                        <p className="text-xs text-slate-500 mt-1">Análises posicionais e temporais</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-5 h-5 text-pink-400" />
                            <h3 className="text-sm font-semibold text-slate-400">Registos Totais</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">~5,826</p>
                        <p className="text-xs text-slate-500 mt-1">Linhas em todas as tabelas</p>
                    </div>
                </div>

                {/* Tables Overview */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                    <h2 className="text-2xl font-bold mb-6">Tabelas Disponíveis</h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-400 mb-2">1. Frequências Posicionais</h3>
                                <p className="text-sm text-slate-400">Contagens absolutas por posição (C1-C5)</p>
                                <p className="text-xs text-slate-500 mt-1">50 números × 5 posições</p>
                            </div>

                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <h3 className="font-semibold text-green-400 mb-2">2. Probabilidades Posicionais</h3>
                                <p className="text-sm text-slate-400">% condicional de aparecer em cada posição</p>
                                <p className="text-xs text-slate-500 mt-1">50 números × 5 posições</p>
                            </div>

                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <h3 className="font-semibold text-orange-400 mb-2">3. Análise de Desvios</h3>
                                <p className="text-sm text-slate-400">Observado vs esperado (chi-quadrado)</p>
                                <p className="text-xs text-slate-500 mt-1">50 números com teste estatístico</p>
                            </div>

                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <h3 className="font-semibold text-purple-400 mb-2">4. Saídas Acumuladas</h3>
                                <p className="text-sm text-slate-400">Contador cumulativo de aparições</p>
                                <p className="text-xs text-slate-500 mt-1">1,852 sorteios × 50 números</p>
                            </div>

                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <h3 className="font-semibold text-yellow-400 mb-2">5. Ausências Consecutivas</h3>
                                <p className="text-sm text-slate-400">Quantos sorteios cada número está ausente</p>
                                <p className="text-xs text-slate-500 mt-1">1,852 sorteios × 50 números</p>
                            </div>

                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <h3 className="font-semibold text-pink-400 mb-2">6. Momentum Score</h3>
                                <p className="text-sm text-slate-400">Score +1/-1 (quente/frio)</p>
                                <p className="text-xs text-slate-500 mt-1">1,852 sorteios × 50 números</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Section */}
                <div className="bg-gradient-to-br from-pink-900/20 to-rose-900/20 border border-pink-800/50 rounded-xl p-8">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-pink-500/20 rounded-lg">
                            <Download className="w-8 h-8 text-pink-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">Exportar para Excel</h2>
                            <p className="text-slate-400 mb-6">
                                Descarrega o ficheiro Excel completo com todas as 6 tabelas de análise.
                                Ficheiro de 1.5 MB com mais de 5,800 linhas de dados.
                            </p>

                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:from-slate-600 disabled:to-slate-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
                            >
                                <Download className="w-5 h-5" />
                                {isExporting ? 'A descarregar...' : 'Descarregar Excel'}
                            </button>

                            {exportStatus && (
                                <p className="mt-4 text-sm font-medium">{exportStatus}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Key Findings */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                    <h2 className="text-2xl font-bold mb-6">Descobertas Principais</h2>

                    <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                            <div>
                                <p className="text-white font-semibold">Concentração Posicional</p>
                                <p className="text-slate-400">Números 1-6 aparecem 76-100% em C1. Números 45-50 aparecem 86-100% em C5.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                            <div>
                                <p className="text-white font-semibold">Números Equilibrados</p>
                                <p className="text-slate-400">Números 18-28 têm distribuição mais uniforme (máximo 35% em qualquer posição).</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                            <div>
                                <p className="text-white font-semibold">Ausências Longas</p>
                                <p className="text-slate-400">Último sorteio: Número 50 ausente há 45 sorteios, Número 23 há 26 sorteios.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
                            <div>
                                <p className="text-white font-semibold">Momentum Negativo</p>
                                <p className="text-slate-400">Todos os números têm momentum negativo (esperado: 5/50 = 10% aparição, 90% ausência).</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
