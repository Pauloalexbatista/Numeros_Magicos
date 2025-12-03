import { prisma } from '@/lib/prisma';
import StagingResultsTable from '@/components/admin/StagingResultsTable';
import StagingSystemSelector from '@/components/admin/StagingSystemSelector';
import { runStagingBackfillAction } from '@/app/actions/staging-actions';
import { rankedSystems } from '@/services/ranked-systems';

export default async function StagingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const selectedSystem = typeof params.system === 'string' ? params.system : undefined;

    // Get all available system names
    const systemNames = rankedSystems.map(s => s.name).sort();

    // Fetch staging data ONLY if a system is selected
    const stagingData = selectedSystem
        ? await prisma.systemPerformanceStaging.findMany({
            where: { systemName: { in: [selectedSystem, `Anti-${selectedSystem}`] } },
            orderBy: { drawId: 'desc' },
            take: 100
        })
        : [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">🧪 Sala de Testes (Staging)</h1>
                <div className="text-sm text-gray-400">
                    Ambiente seguro para testar sistemas antes de lançar.
                </div>
            </div>

            {/* System Selector */}
            <StagingSystemSelector systemNames={systemNames} />

            {selectedSystem ? (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Run Test Form (Specific to Selected System) */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Correr Teste: <span className="text-amber-400">{selectedSystem}</span>
                        </h3>
                        <form action={async (formData) => {
                            'use server';
                            const systemName = formData.get('systemName') as string;
                            const limit = formData.get('limit') ? parseInt(formData.get('limit') as string) : undefined;
                            await runStagingBackfillAction(systemName, limit);
                        }} className="flex gap-4 items-end">

                            {/* Hidden System Name (Locked to Selection) */}
                            <input type="hidden" name="systemName" value={selectedSystem} />

                            <div className="w-full">
                                <label className="block text-xs text-gray-400 mb-1">Limite de Sorteios (Opcional)</label>
                                <input
                                    name="limit"
                                    type="number"
                                    placeholder="Ex: 50 (Deixe vazio para todos)"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                            >
                                Iniciar Teste
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    {stagingData.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                            Ainda não há resultados de teste para <strong>{selectedSystem}</strong>.
                            <br />
                            Corra um teste acima para começar.
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Show Original System */}
                            <StagingResultsTable
                                systemName={selectedSystem}
                                results={stagingData.filter(d => d.systemName === selectedSystem)}
                            />

                            {/* Show Anti-System (if exists) */}
                            {stagingData.some(d => d.systemName === `Anti-${selectedSystem}`) && (
                                <StagingResultsTable
                                    systemName={`Anti-${selectedSystem}`}
                                    results={stagingData.filter(d => d.systemName === `Anti-${selectedSystem}`)}
                                />
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-600">
                    <div className="text-4xl mb-4">👈</div>
                    <p>Selecione um sistema no menu acima para começar.</p>
                </div>
            )}
        </div>
    );
}
