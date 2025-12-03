'use client';

import { useState } from 'react';

interface ExplanationCardProps {
    title: string;
    description: string;
    points: { title: string; text: string; color?: string }[];
    warning?: string;
}

export default function ExplanationCard({ title, description, points, warning }: ExplanationCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
                {isOpen ? '🔽 Ocultar Explicação' : '📖 Como funciona esta ferramenta?'}
            </button>

            {isOpen && (
                <div className="mt-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    <h3 className="text-xl font-bold mb-3 text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                        {title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                        {description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {points.map((point, idx) => (
                            <div key={idx} className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-indigo-100/50 dark:border-indigo-800/30">
                                <h4 className={`font-semibold mb-1 ${point.color || 'text-indigo-700 dark:text-indigo-300'}`}>
                                    {point.title}
                                </h4>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                    {point.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    {warning && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 flex gap-3 items-start">
                            <span className="text-lg">⚠️</span>
                            <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-0.5">
                                {warning}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
