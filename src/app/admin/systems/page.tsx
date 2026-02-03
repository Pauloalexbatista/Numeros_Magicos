import { getSystemsGrouped } from './actions';
import SystemsManager from './SystemsManager';
import ExecutionPanel from './ExecutionPanel';

export default async function AdminSystemsPage() {
    const systemsGrouped = await getSystemsGrouped();

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Gestão de Sistemas</h1>
                <p className="text-gray-600 mt-2">
                    Controle quais sistemas calcular e quando
                </p>

                {/* Nota sobre ML desativado */}
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                        ⚠️ <strong>Nota:</strong> Sistemas de Machine Learning (LSTM Neural Net, Random Forest AI, Standard Deviation, Sistema Elástico)
                        estão temporariamente desativados. Causam hangs durante cálculos e serão refeitos do zero após a implementação
                        multi-jogo estar estável. Ver <code className="bg-amber-500/20 px-1 rounded">SYSTEMS_REMOVED.md</code> para detalhes.
                    </p>
                </div>
            </div>

            {/* Execution Panel */}
            <div className="mb-8">
                <ExecutionPanel />
            </div>

            <SystemsManager initialData={systemsGrouped} />
        </div>
    );
}
