'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, 
    Sparkles, 
    Flame, 
    AlertTriangle, 
    TrendingUp, 
    Award, 
    BarChart2, 
    Info, 
    Wand2, 
    Scissors, 
    ShieldCheck, 
    Check, 
    ExternalLink 
} from 'lucide-react';
import SendToWheelingButton from '@/components/SendToWheelingButton';

interface SystemStats {
    avgAccuracy: number;
    totalDraws: number;
    highHits: number;
}

const GAMES = [
    { id: 'euromillions', key: 'EUROMILLIONS', name: 'Euromilhões', short: 'Euro', accent: 'rgb(59, 130, 246)', border: 'rgba(59, 130, 246, 0.4)', bg: 'rgba(59, 130, 246, 0.08)', halfPoint: 25, totalBalls: 50 },
    { id: 'totoloto', key: 'TOTOLOTO', name: 'Totoloto', short: 'Toto', accent: 'rgb(34, 197, 94)', border: 'rgba(34, 197, 94, 0.4)', bg: 'rgba(34, 197, 94, 0.08)', halfPoint: 25, totalBalls: 49 },
    { id: 'eurodreams', key: 'EURODREAMS', name: 'EuroDreams', short: 'Dream', accent: 'rgb(168, 85, 247)', border: 'rgba(168, 85, 247, 0.4)', bg: 'rgba(168, 85, 247, 0.08)', halfPoint: 20, totalBalls: 40 },
    { id: 'megasena', key: 'MEGASENA', name: 'Mega-Sena', short: 'Mega', accent: 'rgb(245, 158, 11)', border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.08)', halfPoint: 30, totalBalls: 60 },
    { id: 'lotofacil', key: 'LOTOFACIL', name: 'Lotofácil', short: 'Loto', accent: 'rgb(219, 39, 119)', border: 'rgba(219, 39, 119, 0.4)', bg: 'rgba(219, 39, 119, 0.08)', halfPoint: 15, totalBalls: 25 }
];

export default function SystemDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = (params?.slug as string) || 'mais_quentes';

    const [activeGameId, setActiveGameId] = useState<string>('totoloto');
    const [systemData, setSystemData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Initial game from URL query param if present
    useEffect(() => {
        const queryGame = searchParams?.get('game');
        if (queryGame && GAMES.some(g => g.id === queryGame)) {
            setActiveGameId(queryGame);
        }
    }, [searchParams]);

    useEffect(() => {
        let isMounted = true;
        async function fetchSystem() {
            setLoading(true);
            try {
                const res = await fetch('/api/systems/cards');
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && Array.isArray(json.systems)) {
                        const found = json.systems.find((s: any) => s.slug === slug);
                        if (isMounted && found) {
                            setSystemData(found);
                        }
                    }
                }
            } catch (err) {
                console.error('Erro ao carregar sistema:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchSystem();
        return () => { isMounted = false; };
    }, [slug]);

    const activeGame = useMemo(() => {
        return GAMES.find(g => g.id === activeGameId) || GAMES[1];
    }, [activeGameId]);

    const stats: SystemStats = useMemo(() => {
        return systemData?.stats?.[activeGameId] || { avgAccuracy: 0, totalDraws: 0, highHits: 0 };
    }, [systemData, activeGameId]);

    const predictionFull: number[] = useMemo(() => {
        return systemData?.predictions?.[activeGameId] || [];
    }, [systemData, activeGameId]);

    const halfPoint = activeGame.halfPoint;
    const suggestedNumbers = predictionFull.slice(0, halfPoint);
    const remainingNumbers = predictionFull.slice(halfPoint);

    // Detailed historical analysis page link
    const historicalAnalysisUrl = `/ranking/${activeGameId}/${encodeURIComponent(systemData?.dbName || 'Mais Quentes')}`;

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-xs text-muted-foreground font-semibold">A carregar sistema...</p>
                </div>
            </div>
        );
    }

    if (!systemData) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center">
                <p className="text-sm font-bold text-muted-foreground mb-4">Sistema não encontrado.</p>
                <Link href="/games" className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white">
                    Voltar aos Sistemas
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none opacity-25 dark:opacity-15 z-0" style={{
                background: `radial-gradient(circle at 50% 10%, ${activeGame.accent} 0%, transparent 60%)`
            }} />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Back to Systems Hub */}
                <div className="mb-4">
                    <Link
                        href="/games"
                        className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors gap-1.5"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Voltar para Os Nossos Sistemas
                    </Link>
                </div>

                {/* System Identity Banner */}
                <div className="rounded-3xl bg-surface-1/90 border border-border/70 p-6 md:p-8 backdrop-blur-md shadow-sm mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl p-3 rounded-2xl bg-surface-2 border border-border/50">
                                {systemData.familyIcon}
                            </span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
                                        {systemData.name}
                                    </h1>
                                </div>
                                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    Família: {systemData.familyName}
                                </span>
                            </div>
                        </div>

                        {/* Direct link to deep historical analysis page */}
                        <Link
                            href={historicalAnalysisUrl}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-98"
                            style={{ backgroundColor: activeGame.accent }}
                            title={`Consultar distribuição detalhada e histórico concurso a concurso de ${systemData.name} no ${activeGame.name}`}
                        >
                            <BarChart2 className="w-4 h-4" />
                            <span>Analisar Sistema & Histórico →</span>
                        </Link>
                    </div>

                    {/* Explanations: What it does & How it calculates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/60">
                        <div className="p-4 rounded-2xl bg-surface-2/60 border border-border/40">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-primary" />
                                O Que Faz Este Sistema
                            </h3>
                            <p className="text-xs text-foreground/90 leading-relaxed">
                                {systemData.description}
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface-2/60 border border-border/40">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                Como se Calcula
                            </h3>
                            <p className="text-xs text-foreground/90 leading-relaxed">
                                {systemData.howItCalculates}
                            </p>
                        </div>
                    </div>
                </div>

                {/* GAME SELECTOR BAR */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface-1/90 border border-border/70 backdrop-blur-md mb-6 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Selecione o Jogo para Análise & Sugestões:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {GAMES.map(g => {
                            const isSelected = activeGameId === g.id;
                            return (
                                <button
                                    key={g.id}
                                    onClick={() => setActiveGameId(g.id)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'text-white shadow-md scale-105'
                                            : 'text-muted-foreground hover:text-foreground bg-surface-2/60'
                                    }`}
                                    style={{
                                        backgroundColor: isSelected ? g.accent : undefined
                                    }}
                                >
                                    <span>{g.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* GAME METRICS STATS CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="p-4 rounded-2xl bg-surface-1/80 border border-border/60 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                            Precisão Média
                        </span>
                        <div className="text-xl sm:text-2xl font-black" style={{ color: activeGame.accent }}>
                            {stats.avgAccuracy > 0 ? `${stats.avgAccuracy}%` : '—'}
                        </div>
                        <span className="text-[10px] text-muted-foreground">No {activeGame.name}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-1/80 border border-border/60 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                            Picos de Acerto
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-foreground">
                            {stats.highHits} <span className="text-xs font-medium text-muted-foreground">sorteios</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">4 ou 5 acertos</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-1/80 border border-border/60 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                            Histórico Avaliado
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-foreground">
                            {stats.totalDraws} <span className="text-xs font-medium text-muted-foreground">concursos</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">100% verificado</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-1/80 border border-border/60 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                            Frequência Picos
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-foreground">
                            {stats.highHits > 0 && stats.totalDraws > 0
                                ? `1 a cada ${(stats.totalDraws / stats.highHits).toFixed(1)}`
                                : '—'}
                        </div>
                        <span className="text-[10px] text-muted-foreground">Cadência histórica</span>
                    </div>
                </div>

                {/* NEXT PREDICTION: SUGGESTED VS MIRROR (EXACT REPLICA OF THE IMAGE 2 FORMAT) */}
                <div 
                    className="rounded-3xl bg-surface-1/90 border border-border/70 p-5 sm:p-7 backdrop-blur-md shadow-md mb-6"
                    style={{ borderLeft: `3px solid ${activeGame.accent}` }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <span className="text-xl">✨</span>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                                    Próxima Previsão
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                        Próximo Concurso
                                    </span>
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Sugestão ativa para o próximo sorteio do {activeGame.name}. Escolha qual a metade que quer enviar para desdobrar no GCI.
                                </p>
                            </div>
                        </div>
                    </div>

                    {predictionFull.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 py-2">
                            {/* QUADRO 1: SUGERIDOS (TOP HALFPOINT) */}
                            <div 
                                className="flex-1 w-full flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-surface-2/60 dark:bg-surface-2/30 border shadow-xs"
                                style={{ borderColor: `color-mix(in srgb, ${activeGame.accent} 40%, transparent)` }}
                            >
                                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: activeGame.accent }} />
                                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: activeGame.accent }}>
                                            SUGERIDOS (TOP {halfPoint})
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                        {suggestedNumbers.length} Números
                                    </span>
                                </div>

                                <div className="grid grid-cols-5 gap-2 justify-items-center py-2">
                                    {suggestedNumbers.map((num: number, idx: number) => (
                                        <div
                                            key={`sug-${num}`}
                                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-110 cursor-default bg-white dark:bg-card border-2 shadow-xs text-foreground"
                                            style={{
                                                borderColor: activeGame.accent,
                                                boxShadow: `0 0 10px color-mix(in srgb, ${activeGame.accent} 30%, transparent)`
                                            }}
                                            title={`Sugerido #${idx + 1}: ${num}`}
                                        >
                                            {num}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-2 border-t border-border/50">
                                    <SendToWheelingButton
                                        game={activeGame.key}
                                        numbers={suggestedNumbers}
                                        label={`🎯 Enviar Sugeridos (${suggestedNumbers.length})`}
                                        className="w-full justify-center py-2.5 px-3 rounded-xl font-bold text-xs text-white shadow-sm transition-all hover:scale-[1.02]"
                                        style={{ backgroundColor: activeGame.accent }}
                                    />
                                </div>
                            </div>

                            {/* DIVISOR DE CORTE CENTRAL */}
                            <div className="flex md:flex-col items-center justify-center self-stretch px-0.5 my-1 md:my-0">
                                <div className="hidden md:block w-px flex-1 bg-border/80" />
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-surface-2 text-muted-foreground border border-border shrink-0 shadow-xs">
                                    CORTE
                                </span>
                                <div className="hidden md:block w-px flex-1 bg-border/80" />
                            </div>

                            {/* QUADRO 2: RESTANTES (ANTI-SISTEMA) */}
                            <div className="flex-1 w-full flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-surface-2/40 border border-border/60 shadow-xs">
                                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                                        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                            RESTANTES ({remainingNumbers.length})
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                        Anti-Sistema
                                    </span>
                                </div>

                                <div className="grid grid-cols-5 gap-2 justify-items-center py-2">
                                    {remainingNumbers.map((num: number, idx: number) => (
                                        <div
                                            key={`rem-${num}`}
                                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-xs sm:text-sm font-semibold transition-all hover:scale-110 cursor-default bg-surface-1 border border-border text-muted-foreground"
                                            title={`Anti-Sistema #${idx + 1}: ${num}`}
                                        >
                                            {num}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-2 border-t border-border/50">
                                    <SendToWheelingButton
                                        game={activeGame.key}
                                        numbers={remainingNumbers}
                                        label={`🔵 Enviar Restantes (${remainingNumbers.length})`}
                                        className="w-full justify-center py-2.5 px-3 rounded-xl font-bold text-xs bg-surface-2 hover:bg-surface-3 text-foreground border border-border/60 transition-all hover:scale-[1.02]"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-xs text-muted-foreground italic">
                            Previsões a serem sincronizadas para este jogo...
                        </div>
                    )}
                </div>

                {/* ADVICE CARD FOR THIS SYSTEM (SAME CARD APPEARING IN GCI) */}
                <div className="rounded-3xl bg-surface-1/90 border border-border/70 p-6 backdrop-blur-md shadow-sm mb-6">
                    <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                <Sparkles className="w-4 h-4" />
                            </span>
                            <h3 className="text-sm font-black uppercase tracking-wide text-foreground">
                                Cartão de Conselhos Estratégicos &bull; {systemData.name}
                            </h3>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                            Ativo no GCI
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/15 text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
                            <strong className="block text-sm font-bold text-purple-700 dark:text-purple-300 mb-1">
                                💡 {systemData.advice?.headline || 'Regra de Ouro do Sistema'}
                            </strong>
                            {systemData.advice?.rule}
                        </div>

                        {systemData.advice?.warning && (
                            <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-bold text-amber-700 dark:text-amber-300">Atenção ao Risco: </strong>
                                    {systemData.advice.warning}
                                </div>
                            </div>
                        )}

                        {systemData.advice?.opportunity && (
                            <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed flex items-start gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-bold text-emerald-700 dark:text-emerald-300">Gatilho de Oportunidade: </strong>
                                    {systemData.advice.opportunity}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-surface-1 border border-border/70">
                    <div>
                        <h4 className="text-xs font-bold text-foreground">Quer ver todos os sorteios concurso a concurso?</h4>
                        <p className="text-[11px] text-muted-foreground">Consulte a tabela histórica com todas as previsões e acertos reais passados.</p>
                    </div>
                    <Link
                        href={historicalAnalysisUrl}
                        className="py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:scale-105"
                        style={{ backgroundColor: activeGame.accent }}
                    >
                        Abrir Análise Histórica Completa →
                    </Link>
                </div>
            </div>
        </div>
    );
}
