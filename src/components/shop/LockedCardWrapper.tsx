'use client';

import { useState } from 'react';
// import { Lock } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { PurchaseModal } from './PurchaseModal';

interface LockedCardWrapperProps {
    children: React.ReactNode;
    isLocked: boolean;
    card: {
        id: string;
        title: string;
        description: string | null;
        price: number | null;
    };
}

export function LockedCardWrapper({ children, isLocked, card }: LockedCardWrapperProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!isLocked) {
        return <>{children}</>;
    }

    return (
        <div className="relative h-full overflow-hidden rounded-xl">
            {/* Content (No Blur) */}
            <div className="pointer-events-none select-none h-full">
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                <div className="text-center w-full px-2">
                    <div className="mx-auto w-8 h-8 bg-amber-500/80 rounded-full flex items-center justify-center mb-1 shadow-lg backdrop-blur-sm">
                        <span className="text-sm text-white">🔒</span>
                    </div>
                    <p className="text-xs text-white font-bold mb-2 drop-shadow-md">
                        <span className="text-green-400">€{(card.price || 0).toFixed(2)}</span>
                    </p>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] h-7 px-3 rounded-full shadow-lg shadow-black/50"
                    >
                        Desbloquear
                    </Button>
                </div>
            </div>

            <PurchaseModal
                card={card}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
