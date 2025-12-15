import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import BackfillHub from '@/components/admin/BackfillHub';

export default async function AdminSystemPage() {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'ADMIN') {
        redirect('/');
    }

    // Basic Stats for Header
    const drawCount = await prisma.draw.count();
    const lastDraw = await prisma.draw.findFirst({ orderBy: { date: 'desc' } });

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-500">
                            Gestão de Sistema & Backfill
                        </h1>
                        <p className="text-zinc-400 mt-1">
                            Painel Central de Controlo de Dados (Online & Offline)
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-white">{drawCount}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">Sorteios Totais</div>
                        <div className="text-xs text-zinc-600 mt-1">
                            Último: {lastDraw ? new Date(lastDraw.date).toLocaleDateString() : '-'}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Link href="/admin" className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                        ← Voltar ao Dashboard Principal
                    </Link>
                </div>

                {/* Main Hub */}
                <BackfillHub />

            </div>
        </div>
    );
}
