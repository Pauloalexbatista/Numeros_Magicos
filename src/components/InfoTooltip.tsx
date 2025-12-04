'use client';

import { useState } from 'react';

interface InfoTooltipProps {
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function InfoTooltip({ text, position = 'top' }: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div className="relative inline-block">
            <button
                type="button"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={() => setIsVisible(!isVisible)}
                className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-help"
                aria-label="Mais informações"
            >
                ℹ️
            </button>

            {isVisible && (
                <div
                    className={`absolute z-50 ${positionClasses[position]} w-64 px-3 py-2 text-xs text-white bg-zinc-800 dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-700`}
                    role="tooltip"
                >
                    <div className="relative">
                        {text}
                        {/* Arrow */}
                        <div
                            className={`absolute w-2 h-2 bg-zinc-800 dark:bg-zinc-900 border-zinc-700 transform rotate-45 ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1 border-r border-b' :
                                    position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l border-t' :
                                        position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t border-r' :
                                            'right-full top-1/2 -translate-y-1/2 -mr-1 border-b border-l'
                                }`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
