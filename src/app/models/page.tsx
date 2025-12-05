import ModelLabClient from '@/components/ModelLabClient';
import BackButton from '@/components/ui/BackButton';
import Link from 'next/link';

export default async function ModelLabPage() {
    // const session = await auth();
    // const userRole = (session?.user as any)?.role;
    const userRole = 'ADMIN'; // PERMANENT BYPASS

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 md:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <BackButton />
                    <div>
                        <h1 className="text-3xl font-bold">Laboratório de Modelos 🧪</h1>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Backtesting e validação de estratégias de previsão.
                        </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Link
                            href="/models/compare"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <span>📊</span> Comparar Modelos
                        </Link>
                        <Link
                            href="/models/stars"
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <span>⭐</span> Lab. Estrelas
                        </Link>
                    </div>
                </div>

                <ModelLabClient userRole={userRole} />
            </div>
        </div>
    );
}
