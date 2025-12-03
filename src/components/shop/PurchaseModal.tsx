'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { purchaseCard } from '@/app/shop/actions';
import { useRouter } from 'next/navigation';

interface PurchaseModalProps {
    card: {
        id: string;
        title: string;
        description: string | null;
        price: number | null;
    };
    isOpen: boolean;
    onClose: () => void;
}

export function PurchaseModal({ card, isOpen, onClose }: PurchaseModalProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePurchase = async () => {
        setLoading(true);
        try {
            const result = await purchaseCard(card.id);
            if (result.success) {
                onClose();
                router.refresh(); // Refresh to show unlocked card
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Erro ao processar compra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Desbloquear {card.title}</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Tenha acesso vitalício a esta análise avançada.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                        <span className="text-zinc-300">Preço</span>
                        <span className="text-2xl font-bold text-green-400">
                            €{(card.price || 0).toFixed(2)}
                        </span>
                    </div>
                    {card.description && (
                        <p className="mt-4 text-sm text-zinc-500">
                            {card.description}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                        Cancelar
                    </Button>
                    <Button onClick={handlePurchase} disabled={loading} className="bg-green-600 hover:bg-green-500 text-white">
                        {loading ? 'A processar...' : 'Comprar Agora (Simulado)'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
