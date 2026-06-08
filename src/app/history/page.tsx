import { getHistory } from '../actions';
import { HistoryTable } from '@/components/HistoryTable';
import Link from 'next/link';
import { auth } from '@/auth';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export default async function HistoryPage() {
    // const session = await auth();
    // const userRole = (session?.user as any)?.role;
    const userRole = 'ADMIN'; // PERMANENT BYPASS
    const history = await getHistory();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-foreground p-8 font-sans">
            <main className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-border pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Histórico Completo 📜</h1>
                        <p className="text-muted-foreground mt-1">Todos os sorteios registados na base de dados.</p>
                    </div>
                    <Link
                        href="/"
                        className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-md hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                    >
                        ← Voltar à Visão Geral
                    </Link>
                </div>

                {/* History Table */}
                <section>
                    <HistoryTable
                        userRole={userRole}
                        initialDraws={history.map(d => ({
                            ...d,
                            date: d.date.toISOString(),
                            numbers: d.numbers,
                            stars: d.stars,
                            numbersDrawOrder: d.numbersDrawOrder,
                            starsDrawOrder: d.starsDrawOrder
                        }))}
                    />
                </section>

            </main>
            <div className="max-w-5xl mx-auto mt-8">
                <ResponsibleGamingFooter />
            </div>
        </div>
    );
}
