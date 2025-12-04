import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toggleSystemStatus, triggerManualUpdate, triggerBackfill } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminRankingPage() {
    const systems = await prisma.rankedSystem.findMany({
        orderBy: { name: 'asc' },
        include: {
            ranking: true
        }
    });

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Gestão de Sistemas</h1>
                <div className="flex gap-4">
                    <form action={async () => {
                        'use server';
                        await triggerManualUpdate();
                    }}>
                        <Button variant="outline" type="submit">
                            Atualizar Rankings
                        </Button>
                    </form>
                    <form action={async () => {
                        'use server';
                        await triggerBackfill();
                    }}>
                        <Button variant="secondary" type="submit">
                            Rodar Backfill (5 Sorteios)
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid gap-4">
                {systems.map((system) => (
                    <Card key={system.id} className="p-6 bg-slate-900/50 border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    {system.name}
                                    {!system.isActive && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">INATIVO</span>}
                                </h3>
                                <p className="text-sm text-gray-400">{system.description}</p>
                                {system.ranking && (
                                    <div className="mt-2 text-sm text-blue-400">
                                        Precisão: {system.ranking.avgAccuracy.toFixed(1)}% | Previsões: {system.ranking.totalPredictions}
                                    </div>
                                )}
                            </div>

                            <form action={async () => {
                                'use server';
                                await toggleSystemStatus(system.name, !system.isActive);
                            }}>
                                <Button
                                    variant={system.isActive ? "destructive" : "default"}
                                    type="submit"
                                    size="sm"
                                >
                                    {system.isActive ? 'Desativar' : 'Ativar'}
                                </Button>
                            </form>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
