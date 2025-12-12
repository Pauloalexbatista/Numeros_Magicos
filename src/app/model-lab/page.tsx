import { auth } from '@/auth';
import { getHistory } from '@/app/actions';
import Link from 'next/link';
import { ArrowLeft, Beaker, GitCompare } from 'lucide-react';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import IndividualSystemAnalysis from '@/components/IndividualSystemAnalysis';

export const metadata = {
    title: 'Laboratório ML | Números Mágicos',
    description: 'Teste e analise modelos de machine learning'
};

export default async function ModelLabPage() {
    const session = await auth();
    const history = await getHistory();

    // Serialize dates
    const serializedHistory = history.map(d => ({
        ...d,
        date: d.date.toISOString(),
        numbers: d.numbers,
        stars: d.stars,
    }));

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <header className="space-y-6">
                    <Link
                        href="/analysis/numbers"
                        className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar a Números</span>
                    </Link>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-purple-100 dark:bg-purple-900">
                                <Beaker className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black tracking-tight text-purple-600 dark:text-purple-400">
                                    Laboratório ML
                                </h1>
                                <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium mt-2">
                                    Teste e analise modelos de machine learning
                                </p>
                            </div>
                        </div>

                        {/* Link to Comparison */}
                        <Link
                            href="/model-lab/compare"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <GitCompare className="w-5 h-5" />
                            Comparar Sistemas
                        </Link>
                    </div>
                </header>

                {/* Info Card */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                        <Beaker className="w-6 h-6" />
                        Análise Individual de Sistemas
                    </h2>
                    <p className="text-purple-800 dark:text-purple-200 mb-4">
                        Analise o desempenho de um sistema de cada vez e veja a distribuição detalhada de acertos.
                    </p>
                    <div className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                        <p><strong>📊 Prémios Acumulados:</strong> Veja quantas vezes o sistema acertou 0, 1, 2, 3, 4 ou 5 números</p>
                        <p><strong>📈 Precisão:</strong> Taxa média de acerto do sistema</p>
                        <p><strong>🎯 Personalizável:</strong> Escolha o sistema e número de sorteios a analisar</p>
                    </div>
                </div>

                {/* Individual System Analysis */}
                <IndividualSystemAnalysis history={serializedHistory} />

            </div>

            <ResponsibleGamingFooter />
        </div>
    );
}
