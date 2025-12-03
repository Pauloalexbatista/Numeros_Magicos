'use client';

import { useState } from 'react';
import Link from 'next/link';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

interface SequencesClientProps {
    limit: number;
    maxSequences: Record<number, number>;
    maxAbsences: Record<number, number>;
    globalMaxSequences: Record<number, number>;
    globalRecordAbsences: Record<number, number>;
}

export default function SequencesClient({
    limit,
    maxSequences,
    maxAbsences,
    globalMaxSequences,
    globalRecordAbsences
}: SequencesClientProps) {
    const [showLogic, setShowLogic] = useState(false);

    // Determine max values for color scaling
    const maxSeq = Math.max(...Object.values(maxSequences));
    const maxAbs = Math.max(...Object.values(maxAbsences));
    const maxGlobalSeq = Math.max(...Object.values(globalMaxSequences));
    const maxGlobalAbs = Math.max(...Object.values(globalRecordAbsences));

    const getSeqColor = (val: number) => {
        if (val === 0) return 'bg-zinc-50 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600';
        const norm = maxSeq > 0 ? val / maxSeq : 0;
        if (norm >= 0.8) return 'bg-red-600 text-white';
        if (norm >= 0.6) return 'bg-red-500 text-white';
        if (norm >= 0.4) return 'bg-red-400 text-white';
        if (norm >= 0.2) return 'bg-red-300 text-zinc-900';
        return 'bg-red-100 text-zinc-900';
    };

    const getAbsColor = (val: number) => {
        if (val === 0) return 'bg-zinc-50 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600';
        const norm = maxAbs > 0 ? val / maxAbs : 0;
        if (norm >= 0.8) return 'bg-blue-600 text-white';
        if (norm >= 0.6) return 'bg-blue-500 text-white';
        if (norm >= 0.4) return 'bg-blue-400 text-white';
        if (norm >= 0.2) return 'bg-blue-300 text-zinc-900';
        return 'bg-blue-100 text-zinc-900';
    };

    const getRecordSeqColor = (val: number) => {
        const norm = maxGlobalSeq > 0 ? val / maxGlobalSeq : 0;
        // Purple scale for record sequences
        if (norm >= 0.8) return 'bg-purple-600 text-white';
        if (norm >= 0.6) return 'bg-purple-500 text-white';
        if (norm >= 0.4) return 'bg-purple-400 text-white';
        if (norm >= 0.2) return 'bg-purple-300 text-zinc-900';
        return 'bg-purple-100 text-zinc-900';
    };

    const getRecordAbsColor = (val: number) => {
        const norm = maxGlobalAbs > 0 ? val / maxGlobalAbs : 0;
        // Cyan/Teal scale for record absences
        if (norm >= 0.8) return 'bg-cyan-600 text-white';
        if (norm >= 0.6) return 'bg-cyan-500 text-white';
        if (norm >= 0.4) return 'bg-cyan-400 text-white';
        if (norm >= 0.2) return 'bg-cyan-300 text-zinc-900';
        return 'bg-cyan-100 text-zinc-900';
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 font-sans overflow-x-hidden">
            <main className="w-full mx-auto space-y-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Regra Sequências e Ausências 🔄</h1>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Máximos Registados • Últimos {limit > 0 ? limit : 'todos'} sorteios</p>
                        </div>

                        {/* Summary Stats in Header */}
                        <div className="hidden md:flex items-center gap-4 text-xs border-l border-zinc-200 dark:border-zinc-700 pl-4 ml-4">
                            <div>
                                <span className="text-zinc-500 mr-1">Top Seq:</span>
                                <span className="font-bold text-red-600">{maxSeq}</span>
                            </div>
                            <div>
                                <span className="text-zinc-500 mr-1">Top Aus:</span>
                                <span className="font-bold text-blue-600">{maxAbs}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end flex-wrap">
                        {/* Logic Toggle */}
                        <button
                            onClick={() => setShowLogic(!showLogic)}
                            className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                            {showLogic ? '📊 Ver Dados' : '📖 Ver Lógica'}
                        </button>

                        {/* Controls */}
                        <form method="GET" className="flex items-center gap-2">
                            <label htmlFor="limit" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Amostra:</label>
                            <input
                                type="number"
                                id="limit"
                                name="limit"
                                defaultValue={limit === 0 ? '' : limit.toString()}
                                placeholder="Qtd"
                                className="w-16 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-1"
                            />
                            <button type="submit" className="px-3 py-1 text-xs font-medium text-white bg-zinc-800 dark:bg-zinc-700 rounded hover:bg-zinc-700">
                                Atualizar
                            </button>
                            <Link href="/sequences?limit=0" className="px-3 py-1 text-xs font-medium text-zinc-600 bg-zinc-200 rounded hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                                Todos
                            </Link>
                        </form>

                        <Link href="/" className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-200 rounded hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                            ← Voltar
                        </Link>
                    </div>
                </div>

                {/* Logic Explanation */}
                {showLogic && (
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 p-6 rounded-xl border border-green-200 dark:border-green-800 mb-4">
                        <h2 className="text-2xl font-bold mb-4 text-green-900 dark:text-green-100">
                            📖 Lógica de Sequências e Ausências
                        </h2>

                        <div className="space-y-4 text-sm">
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-green-800 dark:text-green-200">
                                    🎯 O que esta página analisa?
                                </h3>
                                <p>
                                    Esta página foca-se na <strong>continuidade</strong>. Analisa quantas vezes seguidas um número saiu (Sequência) ou não saiu (Ausência) dentro da amostra selecionada.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-green-800 dark:text-green-200">
                                    📊 Como ler as linhas?
                                </h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>
                                        <strong className="text-red-600">Seq (Sequência Atual/Máxima na Amostra):</strong>
                                        <br />
                                        Mostra o maior número de vezes consecutivas que o número saiu nos últimos X sorteios.
                                        <span className="text-xs block text-zinc-500 ml-4">Ex: Se o número 5 saiu em 3 sorteios seguidos recentemente, aparecerá "3" a vermelho.</span>
                                    </li>
                                    <li>
                                        <strong className="text-purple-600">Rec (Recorde Global de Sequência):</strong>
                                        <br />
                                        O máximo histórico que este número já atingiu desde o início do EuroMilhões.
                                        <span className="text-xs block text-zinc-500 ml-4">Serve para comparar: "O número está a sair muito, mas será que vai bater o recorde?"</span>
                                    </li>
                                    <li>
                                        <strong className="text-blue-600">Aus (Ausência Atual/Máxima na Amostra):</strong>
                                        <br />
                                        Mostra há quantos sorteios o número não sai (ou o maior intervalo sem sair na amostra).
                                        <span className="text-xs block text-zinc-500 ml-4">Ex: Se o número 10 não sai há 20 sorteios, aparecerá "20" a azul.</span>
                                    </li>
                                    <li>
                                        <strong className="text-cyan-600">Rec (Recorde Global de Ausência):</strong>
                                        <br />
                                        O máximo de tempo que este número já ficou sem sair na história.
                                        <span className="text-xs block text-zinc-500 ml-4">Fundamental para a estratégia de "Números Atrasados". Se a ausência atual está perto do recorde, pode ser um sinal estatístico interessante.</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-green-800 dark:text-green-200">
                                    💡 Estratégias de Jogo
                                </h3>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg">
                                        <h4 className="font-semibold text-blue-600 mb-1">Caça aos Atrasados</h4>
                                        <p className="text-xs">
                                            Procurar números com <strong>Ausência (Aus)</strong> elevada, especialmente se estiver próxima do <strong>Recorde (Rec)</strong>.
                                        </p>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg">
                                        <h4 className="font-semibold text-red-600 mb-1">Surfar a Onda</h4>
                                        <p className="text-xs">
                                            Apostar em números com <strong>Sequência (Seq)</strong> ativa (&gt;1), apostando que a "sorte" vai continuar.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
                                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Aviso Importante</h4>
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    Lembre-se: A "falácia do jogador" é acreditar que um evento é mais provável porque não acontece há muito tempo. No EuroMilhões, as bolas não têm memória. Cada sorteio é independente.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!showLogic && (
                    <section className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 overflow-x-auto">
                        <div className="min-w-max">
                            {/* Header Row */}
                            <div className="flex mb-2 text-[10px] font-mono text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                                <div className="w-8 text-center">#</div>
                                {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                                    <div key={`h-${num}`} className="flex-1 min-w-[28px] text-center">{num}</div>
                                ))}
                            </div>

                            {/* Sequences Row (Sample) */}
                            <div className="flex items-center mb-1">
                                <div className="w-8 text-[10px] font-bold text-red-600">Seq</div>
                                {Array.from({ length: 50 }, (_, i) => i + 1).map(num => {
                                    const val = maxSequences[num];
                                    const color = getSeqColor(val);
                                    return (
                                        <div key={`s-${num}`} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group">
                                            <div className={`
                                            ${color} 
                                            w-full aspect-[3/2] 
                                            flex items-center justify-center 
                                            text-xs font-bold 
                                            rounded-sm
                                            transition-all duration-200
                                            group-hover:scale-110 group-hover:z-10 group-hover:shadow-md
                                        `}>
                                                {val > 0 ? val : '-'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Record Sequences Row (Global) */}
                            <div className="flex items-center mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <div className="w-8 text-[10px] font-bold text-purple-600">Rec</div>
                                {Array.from({ length: 50 }, (_, i) => i + 1).map(num => {
                                    const val = globalMaxSequences[num];
                                    const color = getRecordSeqColor(val);
                                    return (
                                        <div key={`t-${num}`} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group">
                                            <div className={`
                                            ${color} 
                                            w-full aspect-[3/2] 
                                            flex items-center justify-center 
                                            text-xs font-bold 
                                            rounded-sm
                                            opacity-80
                                        `}>
                                                {val}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Absences Row (Sample) */}
                            <div className="flex items-center mb-1">
                                <div className="w-8 text-[10px] font-bold text-blue-600">Aus</div>
                                {Array.from({ length: 50 }, (_, i) => i + 1).map(num => {
                                    const val = maxAbsences[num];
                                    const color = getAbsColor(val);
                                    return (
                                        <div key={`a-${num}`} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group">
                                            <div className={`
                                            ${color} 
                                            w-full aspect-[3/2] 
                                            flex items-center justify-center 
                                            text-xs font-bold 
                                            rounded-sm
                                            transition-all duration-200
                                            group-hover:scale-110 group-hover:z-10 group-hover:shadow-md
                                        `}>
                                                {val > 0 ? val : '-'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Record Absences Row (Global) */}
                            <div className="flex items-center">
                                <div className="w-8 text-[10px] font-bold text-cyan-600">Rec</div>
                                {Array.from({ length: 50 }, (_, i) => i + 1).map(num => {
                                    const val = globalRecordAbsences[num];
                                    const color = getRecordAbsColor(val);
                                    return (
                                        <div key={`r-${num}`} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group">
                                            <div className={`
                                            ${color} 
                                            w-full aspect-[3/2] 
                                            flex items-center justify-center 
                                            text-xs font-bold 
                                            rounded-sm
                                            opacity-80
                                        `}>
                                                {val}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <ResponsibleGamingFooter />
        </div>
    );
}
