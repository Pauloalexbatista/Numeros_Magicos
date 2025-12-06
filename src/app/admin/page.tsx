import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import NeuralNetworkControl from '@/components/admin/NeuralNetworkControl';

export default async function AdminDashboard() {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'ADMIN') {
        redirect('/');
    }

    // Quick Stats
    const userCount = await prisma.user.count();
    const purchaseCount = await prisma.userPurchase.count();
    const totalRevenue = await prisma.userPurchase.aggregate({
        _sum: { amount: true }
    });

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-zinc-400">Bem-vindo, Comandante {session?.user?.name}</p>
                    </div>
                    <Link href="/" className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors">
                        Voltar ao Site
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-zinc-900 border-zinc-800">
                        <div className="text-zinc-400 text-sm">Utilizadores Totais</div>
                        <div className="text-3xl font-bold text-white mt-2">{userCount}</div>
                    </Card>
                    <Card className="p-6 bg-zinc-900 border-zinc-800">
                        <div className="text-zinc-400 text-sm">Vendas Totais</div>
                        <div className="text-3xl font-bold text-green-400 mt-2">{purchaseCount}</div>
                    </Card>
                    <Card className="p-6 bg-zinc-900 border-zinc-800">
                        <div className="text-zinc-400 text-sm">Receita Estimada</div>
                        <div className="text-3xl font-bold text-amber-400 mt-2">
                            €{(totalRevenue._sum.amount || 0).toFixed(2)}
                        </div>
                    </Card>
                </div>

                {/* Tools Grid */}
                <h2 className="text-xl font-bold pt-8">Ferramentas de Gestão</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* User Management */}
                    <Link href="/admin/users" className="block group">
                        <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-indigo-500 transition-colors h-full flex flex-col justify-between">
                            <div>
                                <div className="text-3xl mb-4 bg-indigo-500/10 w-12 h-12 rounded-lg flex items-center justify-center">👥</div>
                                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400">Utilizadores</h3>
                                <p className="text-zinc-400 text-sm mt-2">
                                    Ver lista de utilizadores, editar permissões e ver histórico de compras.
                                </p>
                            </div>
                            <div className="mt-4 text-xs text-indigo-500 font-mono flex items-center gap-1">
                                ACEDER <span className="text-lg">→</span>
                            </div>
                        </Card>
                    </Link>

                    {/* Card Management */}
                    <Link href="/admin/cards" className="block group">
                        <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-purple-500 transition-colors h-full flex flex-col justify-between">
                            <div>
                                <div className="text-3xl mb-4 bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center">🃏</div>
                                <h3 className="text-lg font-bold text-white group-hover:text-purple-400">Cartões & Preços</h3>
                                <p className="text-zinc-400 text-sm mt-2">
                                    Definir preços, visibilidade e ordem dos cartões do dashboard.
                                </p>
                            </div>
                            <div className="mt-4 text-xs text-purple-500 font-mono flex items-center gap-1">
                                GERIR <span className="text-lg">→</span>
                            </div>
                        </Card>
                    </Link>

                    {/* System Status */}
                    <Link href="/admin/system" className="block group">
                        <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-green-500 transition-colors h-full flex flex-col justify-between">
                            <div>
                                <div className="text-3xl mb-4 bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center">⚙️</div>
                                <h3 className="text-lg font-bold text-white group-hover:text-green-400">Sistema & Backfill</h3>
                                <p className="text-zinc-400 text-sm mt-2">
                                    Ver estado da base de dados, correr atualizações e debug.
                                </p>
                            </div>
                            <div className="mt-4 text-xs text-green-500 font-mono flex items-center gap-1">
                                VERIFICAR <span className="text-lg">→</span>
                            </div>
                        </Card>
                    </Link>

                    {/* Debug DB (Restored) */}
                    <Link href="/debug-db" className="block group">
                        <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-red-500 transition-colors h-full flex flex-col justify-between">
                            <div>
                                <div className="text-3xl mb-4 bg-red-500/10 w-12 h-12 rounded-lg flex items-center justify-center">🐛</div>
                                <h3 className="text-lg font-bold text-white group-hover:text-red-400">Debug Database</h3>
                                <p className="text-zinc-400 text-sm mt-2">
                                    Acesso direto aos dados brutos para verificação técnica.
                                </p>
                            </div>
                            <div className="mt-4 text-xs text-red-500 font-mono flex items-center gap-1">
                                DEBUG <span className="text-lg">→</span>
                            </div>
                        </Card>
                    </Link>

                    {/* Staging Area (New) */}
                    <Link href="/admin/staging" className="block group">
                        <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-amber-500 transition-colors h-full flex flex-col justify-between">
                            <div>
                                <div className="text-3xl mb-4 bg-amber-500/10 w-12 h-12 rounded-lg flex items-center justify-center">🧪</div>
                                <h3 className="text-lg font-bold text-white group-hover:text-amber-400">Sala de Testes</h3>
                                <p className="text-zinc-400 text-sm mt-2">
                                    Testar novos sistemas em ambiente seguro (Staging) antes de lançar.
                                </p>
                            </div>
                            <div className="mt-4 text-xs text-amber-500 font-mono flex items-center gap-1">
                                ENTRAR <span className="text-lg">→</span>
                            </div>
                        </Card>
                    </Link>

                </div>

                {/* Neural Network Control */}
                <h2 className="text-xl font-bold pt-8">Redes Neuronais</h2>
                <NeuralNetworkControl />
            </div>
        </div>
    );
}
