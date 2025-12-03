import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { purchaseCard } from './actions';
import { revalidatePath } from 'next/cache';

export default async function StorePage() {
    const session = await auth();
    const user = session?.user?.email ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { purchases: true }
    }) : null;

    const cards = await prisma.dashboardCard.findMany({
        where: {
            isActive: true,
            price: { gt: 0 } // Only show paid cards
        },
        orderBy: { order: 'asc' }
    });

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Loja de Análises 🛒</h1>
                    <p className="text-zinc-500">Adquira módulos avançados para potenciar a sua sorte.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cards.map((card) => {
                        const isPurchased = user?.purchases.some(p => p.cardId === card.id);

                        return (
                            <div key={card.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col">
                                {card.previewImage && (
                                    <div className="h-40 bg-zinc-200 dark:bg-zinc-800 w-full object-cover">
                                        {/* Placeholder for image */}
                                        <div className="w-full h-full flex items-center justify-center text-4xl">
                                            {card.icon}
                                        </div>
                                    </div>
                                )}
                                {!card.previewImage && (
                                    <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-6xl text-white">
                                        {card.icon}
                                    </div>
                                )}

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4 flex-1">
                                        {card.description}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-2xl font-bold">
                                            {card.price === 0 ? 'Grátis' : `€${card.price?.toFixed(2)}`}
                                        </span>

                                        {isPurchased ? (
                                            <button disabled className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium cursor-default">
                                                Adquirido ✅
                                            </button>
                                        ) : (
                                            <form action={async () => {
                                                'use server';
                                                await purchaseCard(card.id);
                                            }}>
                                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                                                    Comprar Agora
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {cards.length === 0 && (
                        <div className="col-span-full text-center py-12 text-zinc-500">
                            Nenhum módulo disponível para compra no momento.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
