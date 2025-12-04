import { getHistory } from '@/app/actions';
import { calculateMean } from '@/services/statistics';
import Link from 'next/link';

export default async function MeanPage() {
    const history = await getHistory();
    const { meanNumbers, meanStars } = calculateMean(history);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 md:p-8 font-sans">
            <main className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Média (Estatística) 📈</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Média aritmética dos números e estrelas nos sorteios históricos.</p>
                    </div>
                    <Link href="/" className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-md hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                        ← Voltar ao Dashboard
                    </Link>
                </div>

                {/* Results */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-xl font-semibold mb-4">Resultados</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center">
                            <span className="text-3xl font-bold text-green-800 dark:text-green-200">{meanNumbers}</span>
                            <p className="text-sm text-green-700 dark:text-green-300">Média de Números (por sorteio)</p>
                        </div>
                        <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg text-center">
                            <span className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">{meanStars}</span>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">Média de Estrelas (por sorteio)</p>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-4">* Calculado sobre {history.length} sorteios históricos.</p>
                </div>
            </main>
        </div>
    );
}
