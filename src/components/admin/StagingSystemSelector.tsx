'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createSystemAction } from '@/app/actions/create-system';

interface Props {
    systemNames: string[];
}

export default function StagingSystemSelector({ systemNames }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSystem = searchParams.get('system') || '';

    const [isCreating, setIsCreating] = useState(false);
    const [newSystemName, setNewSystemName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '__NEW__') {
            setIsCreating(true);
            return;
        }

        if (value) {
            router.push(`/admin/staging?system=${encodeURIComponent(value)}`);
        } else {
            router.push('/admin/staging');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSystemName.trim()) return;

        setIsSubmitting(true);
        const res = await createSystemAction(newSystemName);

        if (res.success) {
            alert(res.message);
            setIsCreating(false);
            setNewSystemName('');
            // Refresh to show new system
            router.refresh();
            // Select the new system
            router.push(`/admin/staging?system=${encodeURIComponent(newSystemName)}`);
        } else {
            alert(res.message);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
            {!isCreating ? (
                <>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Selecionar Sistema para Testar/Auditar
                    </label>
                    <select
                        value={currentSystem}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                    >
                        <option value="">-- Escolha um Sistema --</option>
                        <option value="__NEW__" className="text-amber-400 font-bold">+ ✨ CRIAR NOVO SISTEMA</option>
                        <hr />
                        {systemNames.map(name => (
                            <option key={name} value={name} className="bg-zinc-900">
                                {name}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                        Selecione um sistema existente ou crie um novo para começar a programar a lógica.
                    </p>
                </>
            ) : (
                <form onSubmit={handleCreate} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-amber-400">
                            ✨ Criar Novo Sistema
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="text-xs text-gray-400 hover:text-white"
                        >
                            Cancelar
                        </button>
                    </div>

                    <div>
                        <input
                            type="text"
                            value={newSystemName}
                            onChange={(e) => setNewSystemName(e.target.value)}
                            placeholder="Nome do Sistema (ex: Estratégia dos 3 Últimos)"
                            className="w-full bg-black/40 border border-amber-500/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Dê um nome descritivo. O sistema será criado em branco.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-amber-900/20"
                    >
                        {isSubmitting ? 'A Criar...' : 'Criar Sistema'}
                    </button>
                </form>
            )}
        </div>
    );
}
