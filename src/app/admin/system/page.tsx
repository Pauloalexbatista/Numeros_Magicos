import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import FlashUpdateClient from '@/components/admin/FlashUpdateClient';
import MLUpdateClient from '@/components/admin/MLUpdateClient';

export default async function AdminSystemPage() {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'ADMIN') {
        redirect('/');
    }

    const drawCount = await prisma.draw.count();
    const lastDraw = await prisma.draw.findFirst({ orderBy: { date: 'desc' } });
    const systemCount = await prisma.rankedSystem.count();
    const starSystemCount = await prisma.starSystemRanking.count();

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Estado do Sistema</h1>
                    <Link href="/admin" className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors">
                        Voltar
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                        <h2 className="text-xl font-bold mb-4 text-indigo-400">Base de Dados</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-400">Total Sorteios</span>
                                <span className="font-mono">{drawCount}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-400">Último Sorteio</span>
                                <span className="font-mono">{lastDraw ? new Date(lastDraw.date).toLocaleDateString() : '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-400">Sistemas de Números</span>
                                <span className="font-mono">{systemCount}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-400">Sistemas de Estrelas</span>
                                <span className="font-mono">{starSystemCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                        <h2 className="text-xl font-bold mb-4 text-green-400">Ações Rápidas</h2>
                        <div className="space-y-6">
                            <FlashUpdateClient />
                            <MLUpdateClient />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
