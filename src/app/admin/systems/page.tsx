'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SystemTrendChart from '@/components/admin/SystemTrendChart';
import NewSystemModal from '@/components/admin/NewSystemModal';
import { getRegisteredSystems, toggleSystemStatus } from '@/app/actions/systems';

interface RankedSystem {
    id: number;
    name: string;
    isActive: boolean;
    description: string | null;
}

export default function SystemsPage() {
    const [systems, setSystems] = useState<RankedSystem[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSystem, setExpandedSystem] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSystems = useCallback(async () => {
        try {
            const data = await getRegisteredSystems();
            setSystems(data);
        } catch (error) {
            console.error('Failed to fetch systems:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSystems();
    }, [fetchSystems]);

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            // Optimistic update
            setSystems(prev => prev.map(s =>
                s.id === id ? { ...s, isActive: !currentStatus } : s
            ));
            await toggleSystemStatus(id, !currentStatus);
        } catch (error) {
            console.error('Failed to toggle status:', error);
            fetchSystems(); // Revert on error
        }
    };

    const toggleExpand = (name: string) => {
        setExpandedSystem(expandedSystem === name ? null : name);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Gestão de Sistemas</h2>
                    <p className="text-zinc-500">Gerir algoritmos de previsão e ranking</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    + Novo Sistema
                </button>
            </div>

            <NewSystemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchSystems}
            />

            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-zinc-500">Carregando sistemas...</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-medium text-zinc-900 dark:text-white">Nome</th>
                                <th className="px-6 py-4 font-medium text-zinc-900 dark:text-white">Descrição</th>
                                <th className="px-6 py-4 font-medium text-zinc-900 dark:text-white">Status</th>
                                <th className="px-6 py-4 font-medium text-zinc-900 dark:text-white">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {systems.map((system) => (
                                <React.Fragment key={system.id}>
                                    <tr
                                        className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer ${expandedSystem === system.name ? 'bg-zinc-50 dark:bg-zinc-900/50' : ''}`}
                                        onClick={() => toggleExpand(system.name)}
                                    >
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{system.name}</td>
                                        <td className="px-6 py-4 text-zinc-500">{system.description || '-'}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleStatus(system.id, system.isActive);
                                                }}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${system.isActive
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                                    }`}
                                            >
                                                {system.isActive ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-600 hover:text-blue-700 font-medium text-xs mr-3">
                                                {expandedSystem === system.name ? 'Ocultar Gráfico' : 'Ver Gráfico'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedSystem === system.name && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/30">
                                                <SystemTrendChart systemName={system.name} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
