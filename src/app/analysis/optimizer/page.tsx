import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, TrendingUp, HelpCircle } from 'lucide-react';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import OptimizerClient from '@/components/analysis/OptimizerClient';
import { getActiveSystemsForGame } from '@/app/analysis/actions';

export const metadata = {
    title: 'Otimizador de Intervalos e Dashboard | Números Mágicos',
    description: 'Análise de performance de intervalos de importância de previsões'
};

export const dynamic = 'force-dynamic';

export default async function OptimizerPage() {
    const initialSystems = await getActiveSystemsForGame('EUROMILLIONS');

    return (
        <div className="min-h-screen bg-surface-1 text-foreground p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="space-y-6">
                    <Link
                        href="/analysis/numbers"
                        className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar a Análise de Números</span>
                    </Link>

                    <div>
                        <h1 className="text-5xl font-black tracking-tight text-green-600 dark:text-green-400 flex items-center gap-3">
                            🎯 Otimizador de Intervalos & Dashboard
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium mt-2">
                            Analise qual o melhor intervalo de números por sistema (Sweet Spot) e a importância de cada posição.
                        </p>
                    </div>
                </header>

                <OptimizerClient initialSystems={initialSystems} />
            </div>

            <ResponsibleGamingFooter />
        </div>
    );
}