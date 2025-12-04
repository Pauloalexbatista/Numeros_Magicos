'use client';

import { useState } from 'react';
import DashboardCustomizer from './DashboardCustomizer';

export default function DashboardClientWrapper({ cards }: { cards: any[] }) {
    const [isCustomizing, setIsCustomizing] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsCustomizing(true)}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
                Personalizar ⚙️
            </button>

            {isCustomizing && (
                <DashboardCustomizer
                    cards={cards}
                    onClose={() => setIsCustomizing(false)}
                />
            )}
        </>
    );
}
