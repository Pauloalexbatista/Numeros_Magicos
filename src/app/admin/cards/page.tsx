import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminCardsPage() {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'ADMIN') {
        redirect('/');
    }

    const cards = await prisma.dashboardCard.findMany({
        orderBy: { order: 'asc' }
    });

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Gestão de Cartões</h1>
                    <Link href="/admin" className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors">
                        Voltar
                    </Link>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 text-zinc-400 uppercase">
                            <tr>
                                <th className="p-4">Ordem</th>
                                <th className="p-4">Título</th>
                                <th className="p-4">Role Mínimo</th>
                                <th className="p-4">Preço</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {cards.map((card) => (
                                <tr key={card.id} className="hover:bg-zinc-800/50">
                                    <td className="p-4 text-zinc-500">{card.order}</td>
                                    <td className="p-4 font-medium">
                                        {card.title}
                                        <div className="text-xs text-zinc-500">{card.componentKey}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${card.minRole === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                                            card.minRole === 'PRO' ? 'bg-purple-500/20 text-purple-400' :
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {card.minRole}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {(card.price || 0) > 0 ? (
                                            <span className="text-green-400 font-bold">€{(card.price || 0).toFixed(2)}</span>
                                        ) : (
                                            <span className="text-zinc-600">Grátis</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {card.isActive ? (
                                            <span className="text-green-500">Ativo</span>
                                        ) : (
                                            <span className="text-red-500">Inativo</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-zinc-400">{card.type}</td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/admin/cards/${card.id}`}
                                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                                        >
                                            Editar
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
