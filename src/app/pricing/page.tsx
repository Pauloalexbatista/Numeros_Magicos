import UpgradeButton from "@/components/UpgradeButton";
import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Escolhe o teu Plano
                    </h1>
                    <p className="text-xl text-zinc-500 dark:text-zinc-400">
                        Desbloqueia o poder da Inteligência Artificial para o EuroMilhões.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Tier */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2">Gratuito</h2>
                            <div className="text-4xl font-bold">0€ <span className="text-lg font-normal text-zinc-500">/mês</span></div>
                            <p className="text-zinc-500 mt-4">Para quem joga ocasionalmente.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Resultados Recentes
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Histórico Completo
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Estatísticas Básicas
                            </li>
                            <li className="flex items-center gap-2 text-zinc-400">
                                <span className="text-zinc-300">✕</span> Análise Avançada (IA)
                            </li>
                            <li className="flex items-center gap-2 text-zinc-400">
                                <span className="text-zinc-300">✕</span> Simulação Monte Carlo
                            </li>
                        </ul>
                        <Link
                            href="/"
                            className="w-full py-3 px-6 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold rounded-xl text-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Continuar Grátis
                        </Link>
                    </div>

                    {/* Pro Tier */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border-2 border-indigo-500 relative flex flex-col">
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                            MAIS POPULAR
                        </div>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2 text-indigo-600">Pro</h2>
                            <div className="text-4xl font-bold">9.99€ <span className="text-lg font-normal text-zinc-500">/mês</span></div>
                            <p className="text-zinc-500 mt-4">Para quem quer ganhar a sério.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-2">
                                <span className="text-indigo-500">✓</span> <strong>Tudo do Gratuito</strong>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-indigo-500">✓</span> 🤖 K-Means Clustering
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-indigo-500">✓</span> 🔗 Cadeias de Markov
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-indigo-500">✓</span> 🎲 Simulação Monte Carlo
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-indigo-500">✓</span> 🧪 Laboratório de Modelos
                            </li>
                        </ul>
                        <UpgradeButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
