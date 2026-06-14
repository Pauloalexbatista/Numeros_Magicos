import { getHistory } from '@/app/actions';
import { calculateFrequency } from '@/services/patternDetection';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { BackButton } from '@/components/ui';

export default async function HotColdPage() {
    const history = await getHistory();
    const { numberFreq } = calculateFrequency(history);

    // Transform frequency object into sorted array
    const sortedNumbers = Object.entries(numberFreq)
        .map(([number, count]) => ({ number: parseInt(number), count }))
        .sort((a, b) => b.count - a.count);

    // Get top 10 hot and bottom 10 cold
    const hot = sortedNumbers.slice(0, 10);
    const cold = sortedNumbers.slice(-10).reverse();

    return (
        <div className="min-h-screen bg-surface-1 text-foreground p-4 md:p-8 font-sans">
            <main className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Quentes e Frios 🔥❄️</h1>
                        <p className="text-sm text-muted-foreground">Números mais e menos frequentes nos últimos sorteios.</p>
                    </div>
                    <BackButton href="/analysis/numbers" />
                </div>

                <div className="rounded-xl border border-border bg-surface-1/60 p-6 shadow-sm backdrop-blur-sm">
                    <h2 className="mb-4 text-xl font-semibold text-foreground">🔥 Números Quentes</h2>
                    <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
                        {hot.map(({ number, count }) => (
                            <div key={number} className="relative group">
                                <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md transition-all group-hover:blur-lg" />
                                <div className="relative flex h-12 flex-col items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 text-sm font-black text-white shadow-xl">
                                    <span>{number}</span>
                                    <span className="text-[8px] opacity-80">{count}x</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-surface-1/60 p-6 shadow-sm backdrop-blur-sm">
                    <h2 className="mb-4 text-xl font-semibold text-foreground">❄️ Números Frios</h2>
                    <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
                        {cold.map(({ number, count }) => (
                            <div key={number} className="relative group">
                                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md transition-all group-hover:blur-lg" />
                                <div className="relative flex h-12 flex-col items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-black text-white shadow-xl">
                                    <span>{number}</span>
                                    <span className="text-[8px] opacity-80">{count}x</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground">* Calculado sobre os últimos {history.length} sorteios.</p>
            </main>
            <ResponsibleGamingFooter />
        </div>
    );
}
