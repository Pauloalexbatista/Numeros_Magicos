'use client';

import { useState } from 'react';

interface CopyPredictionButtonProps {
    data: number[];
    label: string;
    className?: string;
}

export default function CopyPredictionButton({ data, label, className = "" }: CopyPredictionButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const textToCopy = data.join(', ');
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm font-bold ${copied
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                } ${className}`}
        >
            <span>{copied ? '✅' : '📋'}</span>
            <span>{copied ? 'Copiado!' : `Copiar ${label}`}</span>
        </button>
    );
}
