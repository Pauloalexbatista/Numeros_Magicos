
import { getHistory } from '@/app/actions';
import StarPatternsClient from '@/components/StarPatternsClient';
import PrimeNumbersClient from '@/components/PrimeNumbersClient';
import ClusteringClient from '@/components/ClusteringClient';
import MarkovClient from '@/components/MarkovClient';
import MonteCarloClient from '@/components/MonteCarloClient';
import Link from 'next/link';

export default async function AdvancedAnalysisPage() {
    const history = await getHistory();

    // Serialize for client component
    const serializedHistory = history.map(d => ({
        ...d,
        date: d.date.toISOString(),
        numbers: d.numbers,
        stars: d.stars,
    }));

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 md:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/"
                        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        ← Voltar
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <span>📈</span> Análise Avançada
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Padrões estatísticos profundos para Números e Estrelas.
                        </p>
                    </div>
                </div>

                <div className="grid gap-8">
                    {/* Positional Analysis Section */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                            <span>📏</span> Análise Posicional (Desvio Padrão)
                        </h2>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                                Analise a distribuição estatística de cada posição da chave (1º ao 5º número).
                                Visualize a "Curva de Sino" e filtre chaves improváveis baseadas no Desvio Padrão.
                            </p>
                            <Link
                                href="/analysis/positional"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                            >
                                Abrir Análise Posicional →
                            </Link>
                        </div>
                    </section>

                    {/* Monte Carlo Section */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-teal-600 dark:text-teal-500">
                            <span>🎲</span> Simulação Monte Carlo
                        </h2>
                        <MonteCarloClient />
                    </section>

                    {/* Markov Chains Section */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-500">
                            <span>🔗</span> Cadeias de Markov (Previsão de Transição)
                        </h2>
                        <MarkovClient />
                    </section>

                    {/* Clustering Section */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-500">
                            <span>🧩</span> K-Means Clustering
                        </h2>
                        <ClusteringClient history={serializedHistory} />
                    </section>

                    {/* Star Patterns Section */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-500">
                            <span>⭐</span> Padrões de Estrelas
                        </h2>
                        <StarPatternsClient />
                    </section>

                    {/* Prime Numbers Section */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-500">
                            <span>🔢</span> Números Primos
                        </h2>
                        <PrimeNumbersClient />
                    </section>
                </div>
            </div>
        </div>
    );
}
