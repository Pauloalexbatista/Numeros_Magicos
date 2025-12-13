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

    // Get cache statistics
    const cachedPredictions = await prisma.cachedPrediction.findMany({
        select: {
            systemName: true,
            numbers: true,
            worstNumbers: true,
            updatedAt: true
        },
        orderBy: {
            systemName: 'asc'
        }
    });

    // Get ranking data for prediction counts
    const rankings = await prisma.systemRanking.findMany({
        select: {
            systemName: true,
            totalPredictions: true,
            avgAccuracy: true
        }
    });

    const rankingMap = new Map(rankings.map(r => [r.systemName, r]));

    // Check how many draws have been processed
    const sampleSystem = await prisma.systemPerformance.findFirst({
        select: { systemName: true }
    });

    let processedDrawsCount = 0;
    if (sampleSystem) {
        const uniqueDraws = await prisma.systemPerformance.groupBy({
            by: ['drawId'],
            where: { systemName: sampleSystem.systemName }
        });
        processedDrawsCount = uniqueDraws.length;
    }

    const cacheStats = cachedPredictions.map(cache => ({
        name: cache.systemName,
        hasNumbers: !!cache.numbers,
        hasWorstNumbers: !!cache.worstNumbers,
        numbersCount: cache.numbers ? JSON.parse(cache.numbers).length : 0,
        lastUpdate: cache.updatedAt,
        isValid: !!cache.numbers && JSON.parse(cache.numbers).length > 0,
        totalPredictions: rankingMap.get(cache.systemName)?.totalPredictions || 0,
        avgAccuracy: rankingMap.get(cache.systemName)?.avgAccuracy || 0
    }));

    const validCacheCount = cacheStats.filter(s => s.isValid).length;
    const totalCacheCount = cacheStats.length;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
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
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-400">Cache Válido</span>
                                <span className="font-mono">
                                    {validCacheCount} / {totalCacheCount}
                                    <span className={`ml-2 text-xs ${validCacheCount === totalCacheCount ? 'text-green-400' : 'text-yellow-400'}`}>
                                        ({((validCacheCount / totalCacheCount) * 100).toFixed(0)}%)
                                    </span>
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-400">Sorteios Processados</span>
                                <span className="font-mono">
                                    {processedDrawsCount} / {drawCount}
                                    <span className={`ml-2 text-xs ${processedDrawsCount >= 100 ? 'text-green-400' :
                                        processedDrawsCount >= 50 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        ({((processedDrawsCount / drawCount) * 100).toFixed(0)}%)
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                        <h2 className="text-xl font-bold mb-4 text-emerald-400">Ações Rápidas</h2>
                        <div className="space-y-4">
                            <FlashUpdateClient />
                            <MLUpdateClient />
                        </div>
                    </div>
                </div>

                {/* Cache Details Table */}
                <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                    <div className="p-6 border-b border-zinc-800">
                        <h2 className="text-xl font-bold text-purple-400">Estado do Cache por Sistema</h2>
                        <p className="text-sm text-zinc-400 mt-1">Sistemas com predições em cache</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Sistema</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">Números</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">Worst 25</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">Previsões</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">Precisão</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">Última Atualização</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {cacheStats.map((stat, idx) => (
                                    <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {stat.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            {stat.hasNumbers ? (
                                                <span className="text-green-400 font-mono">{stat.numbersCount}</span>
                                            ) : (
                                                <span className="text-red-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            {stat.hasWorstNumbers ? (
                                                <span className="text-green-400">✓</span>
                                            ) : (
                                                <span className="text-red-400">✗</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            {stat.totalPredictions > 0 ? (
                                                <span className="text-blue-400 font-mono">{stat.totalPredictions}</span>
                                            ) : (
                                                <span className="text-zinc-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            {stat.avgAccuracy > 0 ? (
                                                <span className={`font-mono ${stat.avgAccuracy >= 50 ? 'text-green-400' :
                                                    stat.avgAccuracy >= 48 ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                    {stat.avgAccuracy.toFixed(1)}%
                                                </span>
                                            ) : (
                                                <span className="text-zinc-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-zinc-400 font-mono">
                                            {new Date(stat.lastUpdate).toLocaleDateString('pt-PT')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            {stat.isValid ? (
                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                                                    Válido
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                                                    Inválido
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {cacheStats.length === 0 && (
                        <div className="p-8 text-center text-zinc-500">
                            Nenhum sistema em cache. Execute "Atualizar Dados" para gerar predições.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
