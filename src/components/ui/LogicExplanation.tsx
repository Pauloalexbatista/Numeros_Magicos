'use client';

import { useState, ReactNode } from 'react';

interface LogicExplanationProps {
    title: string;
    children: ReactNode;
}

export default function LogicExplanation({ title, children }: LogicExplanationProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="space-y-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
                <span>📖</span>
                {isOpen ? 'Esconder Lógica' : 'Ver Lógica'}
            </button>

            {isOpen && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-6 rounded-xl border-2 border-purple-300 dark:border-purple-700 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-bold mb-4 text-purple-900 dark:text-purple-100 flex items-center gap-2">
                        <span>📖</span> {title}
                    </h3>
                    <div className="text-sm text-purple-900 dark:text-purple-100 space-y-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}
