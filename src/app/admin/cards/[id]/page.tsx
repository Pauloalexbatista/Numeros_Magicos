import { prisma } from '@/lib/prisma';
import { updateCard } from '@/app/actions/admin';
import Link from 'next/link';

export default async function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const card = await prisma.dashboardCard.findUnique({
        where: { id }
    });

    if (!card) {
        return <div>Cartão não encontrado</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/cards" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                        ← Voltar
                    </Link>
                    <h1 className="text-3xl font-bold">Editar Cartão</h1>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                    <form action={updateCard.bind(null, card.id)} className="space-y-6">

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Título</label>
                                <input name="title" defaultValue={card.title} className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ícone</label>
                                <input name="icon" defaultValue={card.icon || ''} className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Descrição</label>
                            <input name="description" defaultValue={card.description || ''} className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700" required />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Preço (€)</label>
                                <input name="price" type="number" step="0.01" defaultValue={card.price || 0} className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role Mínimo</label>
                                <select name="minRole" defaultValue={card.minRole} className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700">
                                    <option value="USER">USER</option>
                                    <option value="PRO">PRO</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ordem</label>
                                <input name="order" type="number" defaultValue={card.order} className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Configuração (JSON)</label>
                            <textarea name="config" defaultValue={card.config || '{}'} rows={5} className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 font-mono text-sm" />
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t dark:border-zinc-800">
                            <Link href="/admin/cards" className="px-4 py-2 rounded text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                Cancelar
                            </Link>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium">
                                Salvar Alterações
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
