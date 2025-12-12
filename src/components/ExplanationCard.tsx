'use client';

import { useState, ReactNode } from 'react';

interface ExplanationCardProps {
    title: string;
    description: string;
    points: { title: string; text: string; color?: string }[];
    warning?: string;
}

export default function ExplanationCard({
    title,
    description,
    points = [],
    warning,
    icon,
    color = "indigo"
}: {
    title: string;
    description: string;
    points?: { title: string; text: string; color?: string }[];
    warning?: string;
    icon?: ReactNode;
    color?: "indigo" | "blue" | "green" | "yellow";
}) {
    const [isOpen, setIsOpen] = useState(false);

    const colors = {
        indigo: {
            bg: "bg-indigo-50 dark:bg-indigo-900/20",
            border: "border-indigo-200 dark:border-indigo-800",
            iconBg: "bg-indigo-500",
            text: "text-indigo-700 dark:text-indigo-300",
        },
        blue: {
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-200 dark:border-blue-800",
            iconBg: "bg-blue-500",
            text: "text-blue-700 dark:text-blue-300",
        },
        green: {
            bg: "bg-green-50 dark:bg-green-900/20",
            border: "border-green-200 dark:border-green-800",
            iconBg: "bg-green-500",
            text: "text-green-700 dark:text-green-300",
        },
        yellow: {
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
            border: "border-yellow-200 dark:border-yellow-800",
            iconBg: "bg-yellow-500",
            text: "text-yellow-700 dark:text-yellow-300",
        }
    };

    const theme = colors[color];

    return (
        <div className={`rounded-2xl border-2 ${theme.border} ${theme.bg} shadow-lg transition-all duration-300`}>
            {/* Header - Always Visible */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${theme.iconBg} text-white`}>
                        {icon ? icon : <span className="text-xl">ℹ️</span>}
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold ${theme.text}`}>
                            {title}
                        </h3>
                        {/* Show truncated description when closed */}
                        {!isOpen && (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className={`w-6 h-6 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Content - Collapsible */}
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-6 pt-0 border-t border-zinc-200/50 dark:border-zinc-700/50">
                    <p className="text-zinc-700 dark:text-zinc-300 mb-6 leading-relaxed mt-4">
                        {description}
                    </p>

                    {points.length > 0 && (
                        <div className="space-y-2">
                            {points.map((point, idx) => (
                                <p key={idx} className="text-sm text-zinc-600 dark:text-zinc-400">
                                    <strong className={`${theme.text}`}>{point.title}</strong> {point.text}
                                </p>
                            ))}
                        </div>
                    )}

                    {warning && (
                        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 flex gap-3 items-start">
                            <span className="text-lg">⚠️</span>
                            <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-0.5">
                                {warning}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
