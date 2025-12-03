'use client';

import { useState } from 'react';
import { Simulator } from '@/components/Simulator';
import BackButton from '@/components/ui/BackButton';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

export default function SimulatorPageClient({ history }: { history: any[] }) {
    const [showLogic, setShowLogic] = useState(false);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 md:p-8 font-sans">
            <main className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800 pb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Simulador de Prémios 🎰</h1>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                                Selecione os seus números e veja o que teria ganho no passado.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowLogic(!showLogic)}
                            className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                            {showLogic ? '📊 Ver Simulador' : '📖 Ver Lógica'}
                        </button>
                    </div>
                </div>

                {/* Logic Explanation */}
                {showLogic && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <h2 className="text-2xl font-bold mb-4 text-yellow-900 dark:text-yellow-100">
                            📖 Lógica do Simulador de Prémios
                        </h2>

                        <div className="space-y-4 text-sm">
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-yellow-800 dark:text-yellow-200">
                                    🎯 O que este simulador faz?
                                </h3>
                                <p>
                                    Permite testar uma combinação de números e estrelas contra <strong>todos os sorteios históricos</strong> do EuroMilhões. Mostra quantos prémios teria ganho se tivesse jogado sempre a mesma combinação.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-yellow-800 dark:text-yellow-200">
                                    🏆 Escalões de Prémios
                                </h3>
                                <div className="grid md:grid-cols-2 gap-2 text-xs">
                                    <div className="bg-red-600 text-white p-2 rounded"><strong>5+2:</strong> 1º Escalão (Jackpot)</div>
                                    <div className="bg-red-500 text-white p-2 rounded"><strong>5+1:</strong> 2º Escalão</div>
                                    <div className="bg-orange-500 text-white p-2 rounded"><strong>5+0:</strong> 3º Escalão</div>
                                    <div className="bg-orange-400 text-white p-2 rounded"><strong>4+2:</strong> 4º Escalão</div>
                                    <div className="bg-amber-400 text-black p-2 rounded"><strong>4+1:</strong> 5º Escalão</div>
                                    <div className="bg-amber-300 text-black p-2 rounded"><strong>4+0:</strong> 6º Escalão</div>
                                    <div className="bg-yellow-300 text-black p-2 rounded"><strong>3+2:</strong> 7º Escalão</div>
                                    <div className="bg-yellow-200 text-black p-2 rounded"><strong>3+1:</strong> 8º Escalão</div>
                                    <div className="bg-yellow-100 text-black p-2 rounded"><strong>3+0:</strong> 9º Escalão</div>
                                    <div className="bg-blue-200 text-black p-2 rounded"><strong>2+2:</strong> 10º Escalão</div>
                                    <div className="bg-blue-100 text-black p-2 rounded"><strong>2+1:</strong> 11º Escalão</div>
                                    <div className="bg-zinc-200 text-black p-2 rounded"><strong>1+2:</strong> 12º Escalão</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-yellow-800 dark:text-yellow-200">
                                    💡 Como interpretar os resultados?
                                </h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><strong>0 prémios de 1º escalão é NORMAL:</strong> A probabilidade é de 1 em 140 milhões</li>
                                    <li><strong>Prémios menores (3+0, 2+1, etc.):</strong> São mais comuns e indicam combinações "sortudas"</li>
                                    <li><strong>Total de 0 prémios:</strong> Significa que a combinação nunca acertou nada no histórico</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-yellow-800 dark:text-yellow-200">
                                    🔧 Como usar?
                                </h3>
                                <ol className="list-decimal list-inside space-y-1 ml-4">
                                    <li>Selecione 5 números (1-50) clicando nos quadrados azuis</li>
                                    <li>Selecione 2 estrelas (1-12) clicando nos círculos amarelos</li>
                                    <li>Clique em "Simular Prémios 🎰"</li>
                                    <li>Veja quantos prémios teria ganho em cada escalão</li>
                                </ol>
                            </div>

                            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
                                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Aviso Importante</h4>
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    O desempenho passado NÃO garante resultados futuros. Cada sorteio é independente. Este simulador é apenas para fins educacionais e de entretenimento.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!showLogic && <Simulator history={history} />}
                <ResponsibleGamingFooter />
            </main>
        </div>
    );
}
