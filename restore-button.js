const fs = require('fs');
const file = 'src/components/SendToWheelingButton.tsx';

const content = 'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SendToWheelingButtonProps {
    numbers?: number[];
    stars?: number[];
    label?: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function SendToWheelingButton({ numbers, stars, label, className = '', style }: SendToWheelingButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (numbers && numbers.length > 0) {
            const params = new URLSearchParams({
                numbers: numbers.join(',')
            });
            router.push(\/wheeling?\\);
        } else if (stars && stars.length > 0) {
            const params = new URLSearchParams({
                stars: stars.join(',')
            });
            router.push(\/wheeling/stars?\\);
        }
    };

    const isDisabled = (!numbers || numbers.length === 0) &&
        (!stars || stars.length === 0);

    return (
        <button
            onClick={handleClick}
            disabled={isDisabled}
            className={cn('px-4 py-2 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold rounded-lg transition-all flex items-center gap-2', className || 'bg-purple-600 hover:bg-purple-700 text-white')}
            style={style}
            title={numbers ? \Enviar para Desdobramentos de Números\ : \Enviar para Desdobramentos de Estrelas\}
        >
            {label || \Enviar para Desdobramentos\}
        </button>
    );
}
;

fs.writeFileSync(file, content, 'utf8');