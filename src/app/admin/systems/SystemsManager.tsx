'use client';

import { useState } from 'react';
import { toggleSystemActive, bulkToggleSystems } from './actions';

interface System {
    id: number;
    name: string;
    game: string;
    systemType: string;
    domain: string;
    description: string | null;
    isActive: boolean;
    complexity: number;
    priority: number;
    dependencies: string | null;
}

interface Props {
    initialData: Record<string, System[]>;
}

export default function SystemsManager({ initialData }: Props) {
    const [systems, setSystems] = useState(initialData);
    const [selectedGame, setSelectedGame] = useState<string>('EUROMILLIONS');
    const [filterType, setFilterType] = useState<string>('ALL');
    const [filterDomain, setFilterDomain] = useState<string>('ALL');

    const currentSystems = systems[selectedGame] || [];

    const filteredSystems = currentSystems.filter(s => {
        if (filterType !== 'ALL' && s.systemType !== filterType) return false;
        if (filterDomain !== 'ALL' && s.domain !== filterDomain) return false;
        return true;
    });

    const stats = {
        total: filteredSystems.length,
        active: filteredSystems.filter(s => s.isActive).length,
        base: filteredSystems.filter(s => s.systemType === 'BASE').length,
        neural: filteredSystems.filter(s => s.systemType === 'NEURAL').length,
        ensemble: filteredSystems.filter(s => s.systemType === 'ENSEMBLE').length
    };

    const handleToggle = async (systemId: number, currentState: boolean) => {
        await toggleSystemActive(systemId, !currentState);

        // Update local state
        setSystems(prev => ({
            ...prev,
            [selectedGame]: prev[selectedGame].map(s =>
                s.id === systemId ? { ...s, isActive: !currentState } : s
            )
        }));
    };

    const handleBulkToggle = async (isActive: boolean) => {
        const filters: any = { game: selectedGame };
        if (filterType !== 'ALL') filters.systemType = filterType;
        if (filterDomain !== 'ALL') filters.domain = filterDomain;

        const count = await bulkToggleSystems(filters, isActive);

        // Refresh data
        window.location.reload();
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Jogo</label>
                        <select
                            value={selectedGame}
                            onChange={(e) => setSelectedGame(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="EUROMILLIONS">EuroMillions</option>
                            <option value="TOTOLOTO">Totoloto</option>
                            <option value="EURODREAMS">EuroDreams</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Tipo</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="ALL">Todos</option>
                            <option value="BASE">BASE</option>
                            <option value="NEURAL">NEURAL</option>
                            <option value="ENSEMBLE">ENSEMBLE</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Domínio</label>
                        <select
                            value={filterDomain}
                            onChange={(e) => setFilterDomain(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="ALL">Todos</option>
                            <option value="NUMBERS">Números</option>
                            <option value="STARS">Estrelas</option>
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            onClick={() => handleBulkToggle(true)}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Ativar Filtrados
                        </button>
                        <button
                            onClick={() => handleBulkToggle(false)}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Desativar Filtrados
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    <div className="text-sm text-gray-600">Ativos</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.base}</div>
                    <div className="text-sm text-gray-600">BASE</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.neural}</div>
                    <div className="text-sm text-gray-600">NEURAL</div>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">{stats.ensemble}</div>
                    <div className="text-sm text-gray-600">ENSEMBLE</div>
                </div>
            </div>

            {/* Systems List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sistema</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domínio</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complexidade</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dependências</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredSystems.map(system => {
                            const deps = system.dependencies ? JSON.parse(system.dependencies) : [];

                            return (
                                <tr key={system.id} className={system.isActive ? '' : 'bg-gray-50 opacity-60'}>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggle(system.id, system.isActive)}
                                            className={`w-12 h-6 rounded-full transition-colors ${system.isActive ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${system.isActive ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{system.name}</div>
                                        {system.description && (
                                            <div className="text-xs text-gray-500 mt-1">{system.description}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${system.systemType === 'BASE' ? 'bg-purple-100 text-purple-700' :
                                                system.systemType === 'NEURAL' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-pink-100 text-pink-700'
                                            }`}>
                                            {system.systemType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${system.domain === 'NUMBERS' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {system.domain}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full ${i <= system.complexity ? 'bg-red-500' : 'bg-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {system.priority}
                                    </td>
                                    <td className="px-4 py-3">
                                        {deps.length > 0 ? (
                                            <div className="text-xs text-gray-600">
                                                {deps.slice(0, 2).join(', ')}
                                                {deps.length > 2 && ` +${deps.length - 2}`}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
