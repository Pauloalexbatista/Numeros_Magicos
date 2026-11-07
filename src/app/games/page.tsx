'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
    Sparkles, 
    Search, 
    ArrowRight,
    TrendingUp,
    Flame,
    Target
} from 'lucide-react';

interface SystemCardData {
    slug: string;
    name: string;
    dbName: string;
    family: 'INERTIA' | 'GEOMETRY' | 'CYCLES' | 'INTELLIGENCE';
    familyName: string;
    familyIcon: string;
    description: string;
    howItCalculates: string;
    predictions: Record<string, number[]>;
    stats: Record<string, { avgAccuracy: number; totalDraws: number; highHits: number }>;
}

const GAMES = [
    { id: 'euromillions', key: 'EUROMILLIONS', name: 'Euromilhões', short: 'Euromilhões', accent: 'rgb(59, 130, 246)', border: 'rgba(59, 130, 246, 0.4)', bg: 'rgba(59, 130, 246, 0.1)' },
    { id: 'totoloto', key: 'TOTOLOTO', name: 'Totoloto', short: 'Totoloto', accent: 'rgb(34, 197, 94)', border: 'rgba(34, 197, 94, 0.4)', bg: 'rgba(34, 197, 94, 0.1)' },
    { id: 'eurodreams', key: 'EURODREAMS', name: 'EuroDreams', short: 'EuroDreams', accent: 'rgb(168, 85, 247)', border: 'rgba(168, 85, 247, 0.4)', bg: 'rgba(168, 85, 247, 0.1)' },
    { id: 'megasena', key: 'MEGASENA', name: 'Mega-Sena', short: 'Mega-Sena', accent: 'rgb(245, 158, 11)', border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.1)' },
    { id: 'lotofacil', key: 'LOTOFACIL', name: 'Lotofácil', short: 'Lotofácil', accent: 'rgb(219, 39, 119)', border: 'rgba(219, 39, 119, 0.4)', bg: 'rgba(219, 39, 119, 0.1)' }
];

const FAMILIES = [
    { id: 'ALL', name: 'Todos', icon: '✨' },
    { id: 'MOMENTUM', name: 'Frequência', icon: '🔥' },
    { id: 'GEOMETRY', name: 'Geometria', icon: '📐' },
    { id: 'CYCLES', name: 'Ciclos', icon: '🌀' },
    { id: 'INTELLIGENCE', name: 'Inteligência', icon: '🧠' }
];

export default function GamesHubPage() {
    const [systems, setSystems] = useState<SystemCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFamily, setSelectedFamily] = useState<string>('ALL');
    const [globalGame, setGlobalGame] = useState<string>('totoloto');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let isMounted = true;
        async function loadCards() {
            try {
                const res = await fetch('/api/systems/cards');
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && Array.isArray(json.systems) && isMounted) {
                        setSystems(json.systems);
                    }
                }
            } catch (err) {
                console.error('Erro ao carregar cartões de sistemas:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        loadCards();
        return () => { isMounted = false; };
    }, []);

    const currentGameConfig = useMemo(() => {
        return GAMES.find(g => g.id === globalGame) || GAMES[1];
    }, [globalGame]);

    const filteredSystems = useMemo(() => {
        return systems.filter(s => {
            const matchesFamily = selectedFamily === 'ALL' || 
                s.family === selectedFamily || 
                (selectedFamily === 'MOMENTUM' && ((s.family as any) === 'MOMENTUM' || (s.family as any) === 'INERTIA'));
            const matchesSearch = searchQuery.trim() === '' || 
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.howItCalculates.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFamily && matchesSearch;
        });
    }, [systems, selectedFamily, searchQuery]);

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
            {/* Ambient Background Gradient */}
            <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20 z-0">
                <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Header / Hero */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                                <Sparkles className="w-3.5 h-3.5" />
                                Ecossistema de Sistemas Matemáticos
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {systems.length} Sistemas Operacionais
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                            Os Nossos Sistemas
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mt-1 leading-relaxed">
                            Explore as regras e a eficácia histórica de cada sistema matemático. Clique em qualquer sistema para consultar o seu método de cálculo, números sugeridos e conselhos estratégicos.
                        </p>
                    </div>

                    {/* Selector de Jogo Principal no Topo */}
                    <div className="flex flex-col gap-1.5 shrink-0 bg-surface-1/80 border border-border/60 p-3 rounded-2xl backdrop-blur-md">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                            Analisar sistemas para o jogo:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {GAMES.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => setGlobalGame(g.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        globalGame === g.id
                                            ? 'text-white shadow-sm scale-105 ring-2 ring-white/20'
                                            : 'text-muted-foreground hover:text-foreground bg-surface-2/60 hover:bg-surface-2'
                                    }`}
                                    style={{
                                        backgroundColor: globalGame === g.id ? g.accent : undefined
                                    }}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">
                    {/* Family Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                        {FAMILIES.map(fam => (
                            <button
                                key={fam.id}
                                onClick={() => setSelectedFamily(fam.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    selectedFamily === fam.id
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-surface-1 hover:bg-surface-2 text-muted-foreground hover:text-foreground border border-border/50'
                                }`}
                            >
                                <span>{fam.icon}</span>
                                <span>{fam.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar sistema ou regra..."
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-surface-1 border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                        />
                    </div>
                </div>

                {/* System Cards Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 py-8">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="h-44 rounded-2xl bg-surface-1/50 border border-border/40 animate-pulse p-4 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="h-4 bg-surface-2 rounded-lg w-2/3" />
                                    <div className="h-3 bg-surface-2 rounded-lg w-full" />
                                </div>
                                <div className="h-6 bg-surface-2 rounded-xl w-full" />
                            </div>
                        ))}
                    </div>
                ) : filteredSystems.length === 0 ? (
                    <div className="text-center py-16 bg-surface-1/40 rounded-3xl border border-dashed border-border/60 my-6">
                        <p className="text-sm font-semibold text-muted-foreground">Nenhum sistema encontrado com os filtros selecionados.</p>
                        <button
                            onClick={() => { setSelectedFamily('ALL'); setSearchQuery(''); }}
                            className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-12">
                        {filteredSystems.map(sys => {
                            const stats = sys.stats?.[globalGame] || { avgAccuracy: 0, totalDraws: 0, highHits: 0 };
                            const systemPageUrl = `/systems/${sys.slug}?game=${globalGame}`;

                            return (
                                <Link
                                    key={sys.slug}
                                    href={systemPageUrl}
                                    className="group relative rounded-2xl bg-surface-1/90 dark:bg-[#111827]/90 border border-border/70 hover:border-primary/50 transition-all duration-200 hover:shadow-lg p-4 flex flex-col justify-between backdrop-blur-sm cursor-pointer"
                                    style={{
                                        borderTopColor: currentGameConfig.accent,
                                        borderTopWidth: '3px'
                                    }}
                                >
                                    <div>
                                        {/* Card Header: Icon + Full Name in compact legible font + Family Badge */}
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="text-base shrink-0">{sys.familyIcon}</span>
                                                <h3 className="text-xs sm:text-[13px] font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                                                    {sys.name}
                                                </h3>
                                            </div>
                                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-surface-2 text-muted-foreground shrink-0 border border-border/40">
                                                {sys.familyName.split(' ')[0]}
                                            </span>
                                        </div>

                                        {/* Concise Explanation */}
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                                            {sys.description}
                                        </p>
                                    </div>

                                    <div>
                                        {/* Performance Bar for the Global Selected Game */}
                                        <div className="p-2 rounded-xl bg-surface-2/60 border border-border/40 mb-3 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    {currentGameConfig.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black" style={{ color: currentGameConfig.accent }}>
                                                    {stats.avgAccuracy > 0 ? `${stats.avgAccuracy}%` : '—'}
                                                </span>
                                                {stats.highHits > 0 && (
                                                    <span className="text-[10px] text-muted-foreground font-semibold">
                                                        ({stats.highHits} picos)
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Link */}
                                        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                                            <span>Abrir Sistema & Previsões</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
