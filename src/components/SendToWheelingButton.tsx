'use client';

import { useRouter } from 'next/navigation';

interface SendToWheelingButtonProps {
    numbers?: number[];
    stars?: number[];
    label?: string;
    className?: string;
}

export default function SendToWheelingButton({
    numbers,
    stars,
    label,
    className = ''
}: SendToWheelingButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (numbers && numbers.length > 0) {
            const params = new URLSearchParams({
                numbers: numbers.join(',')
            });
            router.push(`/wheeling?${params.toString()}`);
        } else if (stars && stars.length > 0) {
            const params = new URLSearchParams({
                stars: stars.join(',')
            });
            router.push(`/wheeling/stars?${params.toString()}`);
        }
    };

    const isDisabled = (!numbers || numbers.length === 0) &&
        (!stars || stars.length === 0);

    return (
        <button
            onClick={handleClick}
            disabled={isDisabled}
            className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 
                       disabled:bg-gray-400 disabled:cursor-not-allowed
                       text-white font-bold rounded-lg transition-all 
                       flex items-center gap-2 ${className}`}
            title={numbers ? "Enviar para Desdobramentos de Números" : "Enviar para Desdobramentos de Estrelas"}
        >
            🎟️ {label || "Enviar para Desdobramentos"}
        </button>
    );
}
