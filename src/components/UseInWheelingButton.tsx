'use client';

import Link from 'next/link';

interface UseInWheelingButtonProps {
    numbers?: number[];
    stars?: number[];
    type?: 'numbers' | 'stars' | 'both';
    className?: string;
}

export function UseInWheelingButton({
    numbers = [],
    stars = [],
    type = 'both',
    className = ''
}: UseInWheelingButtonProps) {
    if (numbers.length === 0 && stars.length === 0) return null;

    const params = new URLSearchParams();
    if (numbers.length > 0 && (type === 'numbers' || type === 'both')) {
        params.set('numbers', numbers.join(','));
    }
    if (stars.length > 0 && (type === 'stars' || type === 'both')) {
        params.set('stars', stars.join(','));
    }

    const url = `/wheeling?${params.toString()}`;

    const getIcon = () => {
        if (type === 'numbers') return '🔢';
        if (type === 'stars') return '⭐';
        return '🎟️';
    };

    const getLabel = () => {
        if (type === 'numbers') return 'Usar Números';
        if (type === 'stars') return 'Usar Estrelas';
        return 'Usar em Desdobramentos';
    };

    return (
        <Link
            href={url}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm ${className}`}
        >
            <span>{getIcon()}</span>
            <span>{getLabel()}</span>
        </Link>
    );
}
