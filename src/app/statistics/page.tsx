import { getHistory } from '@/app/actions';
import { calculateFrequency } from '@/services/statistics';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { BackButton } from '@/components/ui';

export default async function HotColdPage() {
    const history = await getHistory();
    const { hot, cold } = calculateFrequency(history);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 md:p-8 font-sans">
            <main className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Quentes e Frios 🔥❄️</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Números mais e menos frequentes nos últimos sorteios.</p>
                    </div>
                    <BackButton href="/analysis/numbers" />
                </div>

                {/* Hot Numbers */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">🔥 Números Quentes</h2>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                        {hot.map(({ number, count }) => (
                            <div key={number} className="relative group">
                                <div className="absolute inset-0 bg-red-400/30 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                                <div className="relative w-12 h-12 flex flex-col items-center justify-center bg-gradient-to-br from-red-400 to-red-600 rounded-full text-sm font-black text-white shadow-xl border-2 border-red-300">
                                    <span>{number}</span>
                                    <span className="text-[8px] opacity-70">{count}x</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cold Numbers */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">❄️ Números Frios</h2>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                        {cold.map(({ number, count }) => (
                            <div key={number} className="relative group">
                                <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                                <div className="relative w-12 h-12 flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 rounded-full text-sm font-black text-white shadow-xl border-2 border-blue-300">
                                    <span>{number}</span>
                                    <span className="text-[8px] opacity-70">{count}x</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-zinc-500 text-center">* Calculado sobre os últimos {history.length} sorteios.</p>
            </main>
            <ResponsibleGamingFooter />
        </div>
    );
}
