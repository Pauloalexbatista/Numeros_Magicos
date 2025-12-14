
import React from 'react';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import { ArrowRight, Database, Brain, Trophy, LineChart } from 'lucide-react';

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-12 max-w-5xl">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Como Funciona
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Descubra a ciência por trás das previsões do Números Mágicos.
                        </p>
                    </div>
                </div>

                {/* Workflow Steps */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 -translate-y-1/2 -z-10" />

                    {/* Step 1: Database */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xl group-hover:bg-blue-500/20 transition-all" />
                        <Card className="relative p-6 bg-slate-900/80 border-slate-800 backdrop-blur-sm hover:border-blue-500/50 transition-all h-full">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                                <Database size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">1. Base de Dados</h3>
                            <p className="text-slate-400 text-sm">
                                Mantemos uma tabela rigorosa com todos os <strong>1897+ sorteios</strong> históricos do Euromilhões, atualizada semanalmente.
                            </p>
                        </Card>
                    </div>

                    {/* Step 2: System Rules */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-xl group-hover:bg-purple-500/20 transition-all" />
                        <Card className="relative p-6 bg-slate-900/80 border-slate-800 backdrop-blur-sm hover:border-purple-500/50 transition-all h-full">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                                <Brain size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">2. Algoritmos</h3>
                            <p className="text-slate-400 text-sm">
                                Criamos sistemas com regras matemáticas precisas (ex: Redes Neuronais LSTM, Vortex Math, Padrões Quentes) para analisar os números.
                            </p>
                        </Card>
                    </div>

                    {/* Step 3: Backtesting */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-pink-500/10 rounded-2xl blur-xl group-hover:bg-pink-500/20 transition-all" />
                        <Card className="relative p-6 bg-slate-900/80 border-slate-800 backdrop-blur-sm hover:border-pink-500/50 transition-all h-full">
                            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4 text-pink-400">
                                <LineChart size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">3. Análise Histórica</h3>
                            <p className="text-slate-400 text-sm">
                                O sistema percorre sorteio a sorteio no passado, verificando se teria acertado. Isso gera uma <strong>Taxa de Sucesso</strong> real e comprovada.
                            </p>
                        </Card>
                    </div>

                    {/* Step 4: Prediction */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-xl group-hover:bg-emerald-500/20 transition-all" />
                        <Card className="relative p-6 bg-slate-900/80 border-slate-800 backdrop-blur-sm hover:border-emerald-500/50 transition-all h-full">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                                <Trophy size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">4. Ranking e Previsão</h3>
                            <p className="text-slate-400 text-sm">
                                Identificamos os sistemas com melhor performance recente (Top 100 sorteios) e usamos esses modelos "quentes" para gerar os próximos números.
                            </p>
                        </Card>
                    </div>
                </div>

                {/* FAQ Style Explanations */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-6 bg-slate-900/40 border-slate-800">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">O que influencia o Ranking?</h4>
                        <p className="text-slate-400">
                            O nosso ranking principal foca-se nos <strong>últimos 100 sorteios</strong> (aprox. 1 ano). Isto permite identificar sistemas que estão em "boa forma" atualmente, em vez de depender de sucessos de há 10 anos atrás.
                        </p>
                    </Card>

                    <Card className="p-6 bg-slate-900/40 border-slate-800">
                        <h4 className="text-lg font-semibold text-purple-400 mb-3">O que é o Score de Qualidade?</h4>
                        <p className="text-slate-400">
                            Diferente da "Precisão" simples, o nosso Score valoriza prémios reais. Um sistema ganha 100 pontos por um Jackpot (5 acertos), 10 pontos por 4 acertos e 1 ponto por 3 acertos.
                        </p>
                    </Card>
                </div>

                {/* CTA */}
                <div className="flex justify-center pt-8">
                    <a
                        href="/ranking"
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-1"
                    >
                        Ver Ranking de Sistemas
                        <ArrowRight size={20} />
                    </a>
                </div>

            </div>
        </div>
    );
}
