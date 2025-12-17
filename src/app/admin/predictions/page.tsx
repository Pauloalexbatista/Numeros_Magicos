import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { BackButton } from '@/components/ui';
import SystemFilterClient from '@/components/admin/SystemFilterClient';

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: {
        system?: string;
        page?: string;
    }
}

export default async function AdminPredictionsPage({ searchParams }: Props) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || '1');
    const pageSize = 50;
    const skip = (currentPage - 1) * pageSize;

    // Get all systems
    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { name: true }
    });

    const selectedSystem = params.system || systems[0]?.name || '';

    if (!selectedSystem && systems.length > 0) {
        redirect(`/admin/predictions?system=${encodeURIComponent(systems[0].name)}`);
    }

    // Get predictions for selected system
    const [predictions, totalCount] = await Promise.all([
        prisma.systemPrediction.findMany({
            where: { systemName: selectedSystem },
            orderBy: { draw: { date: 'desc' } },
            take: pageSize,
            skip,
            include: {
                draw: {
                    select: {
                        id: true,
                        date: true,
                        numbers: true
                    }
                }
            }
        }),
        prisma.systemPrediction.count({
            where: { systemName: selectedSystem }
        })
    ]);

    // Get anti-system name
    const antiSystemName = selectedSystem.startsWith('Anti-')
        ? selectedSystem.substring(5)
        : `Anti-${selectedSystem}`;

    // Get anti-system predictions for the same draws
    const drawIds = predictions.map(p => p.drawId);
    const antiPredictions = await prisma.systemPrediction.findMany({
        where: {
            systemName: antiSystemName,
            drawId: { in: drawIds }
        },
        select: {
            drawId: true,
            prediction: true,
            hits: true
        }
    });

    const antiPredMap = new Map(antiPredictions.map(ap => [ap.drawId, ap]));

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BackButton href="/admin/system" />
                        <div>
                            <h1 className="text-3xl font-bold text-white">Consulta de Previsões</h1>
                            <p className="text-slate-400">Visualize previsões e anti-previsões por sistema (apenas leitura)</p>
                        </div>
                    </div>
                </div>

                {/* System Filter */}
                <SystemFilterClient systems={systems} selectedSystem={selectedSystem} />


                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                        <div className="text-sm text-slate-400">Total de Previsões</div>
                        <div className="text-2xl font-bold text-white">{totalCount}</div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                        <div className="text-sm text-slate-400">Sistema Selecionado</div>
                        <div className="text-lg font-bold text-blue-400">{selectedSystem}</div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                        <div className="text-sm text-slate-400">Anti-Sistema</div>
                        <div className="text-lg font-bold text-purple-400">{antiSystemName}</div>
                    </div>
                </div>

                {/* Predictions Table */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="p-4 text-left">Sorteio</th>
                                    <th className="p-4 text-left">Data</th>
                                    <th className="p-4 text-left">Números Sorteados</th>
                                    <th className="p-4 text-center">Acertos Sistema</th>
                                    <th className="p-4 text-left">Previsão Sistema (25)</th>
                                    <th className="p-4 text-center">Acertos Anti</th>
                                    <th className="p-4 text-left">Previsão Anti-Sistema (25)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {predictions.map((pred) => {
                                    const winningNumbers = typeof pred.draw.numbers === 'string'
                                        ? JSON.parse(pred.draw.numbers)
                                        : pred.draw.numbers;

                                    const systemPrediction = typeof pred.prediction === 'string'
                                        ? JSON.parse(pred.prediction)
                                        : pred.prediction;

                                    const antiPred = antiPredMap.get(pred.drawId);
                                    const antiSystemPrediction = antiPred
                                        ? (typeof antiPred.prediction === 'string'
                                            ? JSON.parse(antiPred.prediction)
                                            : antiPred.prediction)
                                        : [];

                                    return (
                                        <tr key={pred.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-bold text-white">#{pred.draw.id}</td>
                                            <td className="p-4 text-slate-300">
                                                {new Date(pred.draw.date).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {winningNumbers.map((num: number) => (
                                                        <span
                                                            key={num}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500 text-black text-xs font-bold"
                                                        >
                                                            {num}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`text-lg font-bold ${pred.hits >= 3 ? 'text-green-400' :
                                                    pred.hits >= 1 ? 'text-yellow-400' :
                                                        'text-slate-500'
                                                    }`}>
                                                    {pred.hits}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1 max-w-md">
                                                    {systemPrediction.map((num: number) => {
                                                        const isHit = winningNumbers.includes(num);
                                                        return (
                                                            <span
                                                                key={num}
                                                                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${isHit
                                                                    ? 'bg-green-500 text-white shadow-lg'
                                                                    : 'bg-slate-700 text-slate-300'
                                                                    }`}
                                                            >
                                                                {num}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                {antiPred ? (
                                                    <span className={`text-lg font-bold ${antiPred.hits >= 3 ? 'text-purple-400' :
                                                        antiPred.hits >= 1 ? 'text-yellow-400' :
                                                            'text-slate-500'
                                                        }`}>
                                                        {antiPred.hits}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1 max-w-md">
                                                    {antiSystemPrediction.length > 0 ? (
                                                        antiSystemPrediction.map((num: number) => {
                                                            const isHit = winningNumbers.includes(num);
                                                            return (
                                                                <span
                                                                    key={num}
                                                                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${isHit
                                                                        ? 'bg-purple-500 text-white shadow-lg'
                                                                        : 'bg-slate-700 text-slate-300'
                                                                        }`}
                                                                >
                                                                    {num}
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-slate-500 italic">Não disponível</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                            <div className="text-sm text-slate-400">
                                Página {currentPage} de {totalPages}
                            </div>
                            <div className="flex gap-2">
                                {currentPage > 1 && (
                                    <a
                                        href={`/admin/predictions?system=${encodeURIComponent(selectedSystem)}&page=${currentPage - 1}`}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                                    >
                                        Anterior
                                    </a>
                                )}
                                {currentPage < totalPages && (
                                    <a
                                        href={`/admin/predictions?system=${encodeURIComponent(selectedSystem)}&page=${currentPage + 1}`}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Próxima
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
