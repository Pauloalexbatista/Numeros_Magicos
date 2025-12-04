'use client';

import React, { useState, useEffect } from 'react';
import { createSystem, getAvailableAlgorithms } from '@/app/actions/systems';

interface Algorithm {
    name: string;
    description: string;
}

export default function NewSystemModal({
    isOpen,
    onClose,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
    const [selectedAlgo, setSelectedAlgo] = useState<string>('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setFetching(true);
            getAvailableAlgorithms()
                .then(setAlgorithms)
                .finally(() => setFetching(false));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAlgo) return;

        setLoading(true);
        try {
            await createSystem(selectedAlgo, description);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao criar sistema');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fill description when algo is selected
    useEffect(() => {
        const algo = algorithms.find(a => a.name === selectedAlgo);
        if (algo) {
            setDescription(algo.description);
        }
    }, [selectedAlgo, algorithms]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800 shadow-xl">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Novo Sistema</h3>

                {fetching ? (
                    <div className="text-center py-8 text-zinc-500">Carregando algoritmos...</div>
                ) : algorithms.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-zinc-500 mb-4">Todos os algoritmos disponíveis já estão registados.</p>
                        <button onClick={onClose} className="text-blue-600 hover:underline">Fechar</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Algoritmo Base
                            </label>
                            <select
                                value={selectedAlgo}
                                onChange={(e) => setSelectedAlgo(e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
                                required
                            >
                                <option value="">Selecione um algoritmo...</option>
                                {algorithms.map(algo => (
                                    <option key={algo.name} value={algo.name}>{algo.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Descrição
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm h-24 resize-none"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !selectedAlgo}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                            >
                                {loading ? 'A criar...' : 'Criar Sistema'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
