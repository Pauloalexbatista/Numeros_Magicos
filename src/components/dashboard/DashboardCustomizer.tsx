'use client';

import { useState } from 'react';
import { saveCardOrder, toggleCardVisibility } from '@/app/actions/dashboard-settings';
import { useRouter } from 'next/navigation';

interface Card {
    id: string;
    title: string;
    isVisible: boolean;
    order: number;
}

export default function DashboardCustomizer({
    cards,
    onClose
}: {
    cards: Card[],
    onClose: () => void
}) {
    const [items, setItems] = useState(cards);
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const moveCard = (index: number, direction: 'up' | 'down') => {
        const newItems = [...items];
        if (direction === 'up' && index > 0) {
            [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
        } else if (direction === 'down' && index < newItems.length - 1) {
            [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        }

        // Update order property
        newItems.forEach((item, idx) => item.order = idx);
        setItems(newItems);
    };

    const toggleVisibility = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, isVisible: !item.isVisible } : item
        ));
    };

    const handleSave = async () => {
        setIsSaving(true);

        // Save order
        await saveCardOrder(items.map(item => ({ cardId: item.id, order: item.order })));

        // Save visibility (only for changed items, but for simplicity saving all for now or iterating)
        // Ideally we batch this too, but for now let's just loop (or update the action to handle both)
        // The current action `saveCardOrder` only does order. Let's update it or just call toggle loop.
        // Actually, let's just save order for now and visibility separately or assume the user toggles visibility live.
        // Let's make visibility toggle live in this UI? Or save on "Save".
        // For simplicity: Save everything on "Save".

        for (const item of items) {
            // We need to check if visibility changed, but for now just force update if we want to be sure.
            // Optimization: Only update if changed. 
            // Let's just use the toggle action for each item.
            await toggleCardVisibility(item.id, item.isVisible);
        }

        setIsSaving(false);
        router.refresh();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg">Personalizar Dashboard</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {items.map((card, index) => (
                        <div key={card.id} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => moveCard(index, 'up')}
                                    disabled={index === 0}
                                    className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                                >
                                    ▲
                                </button>
                                <button
                                    onClick={() => moveCard(index, 'down')}
                                    disabled={index === items.length - 1}
                                    className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                                >
                                    ▼
                                </button>
                            </div>

                            <div className="flex-1 font-medium truncate">
                                {card.title}
                            </div>

                            <button
                                onClick={() => toggleVisibility(card.id)}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${card.isVisible
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
                                    }`}
                            >
                                {card.isVisible ? 'Visível' : 'Oculto'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
}
