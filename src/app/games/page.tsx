'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
    Flame, 
    Layers, 
    Cpu, 
    Sparkles, 
    Search, 
    Wand2, 
    ExternalLink, 
    Scissors, 
    Filter,
    Check,
    RotateCcw
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
}

const GAMES = [
    { id: 'euromillions', key: 'EUROMILLIONS', name: 'Euromilhões', short: 'Euro', accent: 'rgb(59, 130, 246)', border: 'rgba(59, 130, 246, 0.4)', bg: 'rgba(59, 130, 246, 0.1)' },
    { id: 'totoloto', key: 'TOTOLOTO', name: 'Totoloto', short: 'Toto', accent: 'rgb(34, 197, 94)', border: 'rgba(34, 197, 94, 0.4)', bg: 'rgba(34, 197, 94, 0.1)' },
    { id: 'eurodreams', key: 'EURODREAMS', name: 'EuroDreams', short: 'Dream', accent: 'rgb(168, 85, 247)', border: 'rgba(168, 85, 247, 0.4)', bg: 'rgba(168, 85, 247, 0.1)' },
    { id: 'megasena', key: 'MEGASENA', name: 'Mega-Sena', short: 'Mega', accent: 'rgb(245, 158, 11)', border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.1)' },
    { id: 'lotofacil', key: 'LOTOFACIL', name: 'Lotofácil', short: 'Loto', accent: 'rgb(219, 39, 119)', border: 'rgba(219, 39, 119, 0.4)', bg: 'rgba(219, 39, 119, 0.1)' }
];

const FAMILIES = [
    { id: 'ALL', name: 'Todos', icon: '✨' },
    { id: 'INERTIA', name: 'Inércia', icon: '🔥' },
    { id: 'GEOMETRY', name: 'Geometria', icon: '📐' },
    { id: 'CYCLES', name: 'Ciclos', icon: '🌀' },
    { id: 'INTELLIGENCE', name: 'Inteligência', icon: '🧠' }
];

export default function GamesHubPage() {
    const [systems, setSystems] = useState<SystemCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFamily, setSelectedFamily] = useState<string>('ALL');
    const [globalGame, setGlobalGame] = useState<string>('euromillions');
    const [cardGameMap, setCardGameMap] = useState<Record<string, string>>({});
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
                        // Initialize each card's selected game with globalGame
                        const initialMap: Record<string, string> = {};
                        json.systems.forEach((s: SystemCardData) => {
                            initialMap[s.slug] = 'euromillions';
                        });
                        setCardGameMap(initialMap);
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

    // When global game changes, update all cards that haven't been manually overridden, or all
    const handleSetGlobalGame = (gameId: string) => {
        setGlobalGame(gameId);
        const updated: Record<string, string> = {};
        systems.forEach(s => {
            updated[s.slug] = gameId;
        });
        setCardGameMap(updated);
    };

    const handleCardGameChange = (slug: string, gameId: string) => {
        setCardGameMap(prev => ({
            ...prev,
            [slug]: gameId
        }));
    };

    const filteredSystems = useMemo(() => {
        return systems.filter(s => {
            const matchesFamily = selectedFamily === 'ALL' || s.family === selectedFamily;
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
                            Conheça as regras e o método de cálculo de cada sistema. Veja as bolas sugeridas por jogo, consulte a análise detalhada ou envie os números diretamente para o Gerador de Chaves Inteligente (GCI).
                        </p>
                    </div>

                    {/* Global Quick Game Preset */}
                    <div className="flex flex-col gap-1.5 shrink-0 bg-surface-1/80 border border-border/60 p-2.5 rounded-2xl backdrop-blur-md">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                            Predefinir todos os cartões para:
                        </span>
                        <div className="flex items-center gap-1">
                            {GAMES.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => handleSetGlobalGame(g.id)}
                                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                                        globalGame === g.id
                                            ? 'text-white shadow-sm scale-105'
                                            : 'text-muted-foreground hover:text-foreground bg-surface-2/60'
                                    }`}
                                    style={{
                                        backgroundColor: globalGame === g.id ? g.accent : undefined
                                    }}
                                >
                                    {g.short}
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
                            <div key={i} className="h-64 rounded-2xl bg-surface-1/50 border border-border/40 animate-pulse p-4 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="h-4 bg-surface-2 rounded-lg w-2/3" />
                                    <div className="h-3 bg-surface-2 rounded-lg w-full" />
                                    <div className="h-3 bg-surface-2 rounded-lg w-4/5" />
                                </div>
                                <div className="h-8 bg-surface-2 rounded-xl w-full" />
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
                            const currentCardGameId = cardGameMap[sys.slug] || globalGame;
                            const currentGameConfig = GAMES.find(g => g.id === currentCardGameId) || GAMES[0];
                            const preds = sys.predictions[currentCardGameId] || [];
                            const top5 = preds.slice(0, 5);
                            const top25 = preds.slice(0, 25);
                            const numbersQuery = top25.join(',');

                            // Dynamic link to the existing detailed page of that game/system
                            const detailedPageUrl = `/ranking/${currentCardGameId}/${encodeURIComponent(sys.dbName)}`;
                            // GCI direct link
                            const gciUrl = `/wheeling?game=${currentCardGameId}&numbers=${numbersQuery}`;

                            return (
                                <div
                                    key={sys.slug}
                                    className="group relative rounded-2xl bg-surface-1/90 dark:bg-[#111827]/90 border border-border/70 hover:border-border transition-all duration-200 hover:shadow-md p-4 flex flex-col justify-between backdrop-blur-sm"
                                    style={{
                                        borderTopColor: currentGameConfig.accent,
                                        borderTopWidth: '3px'
                                    }}
                                >
                                    <div>
                                        {/* Card Header: Icon + Title + Family Badge */}
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="text-base shrink-0">{sys.familyIcon}</span>
                                                <h3 className="text-xs sm:text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                                                    {sys.name}
                                                </h3>
                                            </div>
                                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-surface-2 text-muted-foreground shrink-0 border border-border/40">
                                                {sys.familyName.split(' ')[0]}
                                            </span>
                                        </div>

                                        {/* Concise Explanation: What it does & How it calculates */}
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                                            {sys.howItCalculates}
                                        </p>

                                        {/* Compact Game Selector Tabs inside Card */}
                                        <div className="flex items-center gap-1 mb-3 p-1 rounded-xl bg-surface-2/70 border border-border/40">
                                            {GAMES.map(g => {
                                                const isActive = currentCardGameId === g.id;
                                                return (
                                                    <button
                                                        key={g.id}
                                                        onClick={() => handleCardGameChange(sys.slug, g.id)}
                                                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all text-center ${
                                                            isActive
                                                                ? 'text-white shadow-xs'
                                                                : 'text-muted-foreground hover:text-foreground hover:bg-surface-1'
                                                        }`}
                                                        style={{
                                                            backgroundColor: isActive ? g.accent : 'transparent'
                                                        }}
                                                    >
                                                        {g.short}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Suggested Numbers for Active Game */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                                                <span>Sugeridos Próx. Sorteio</span>
                                                <span className="text-[9px] font-normal text-muted-foreground/80">{currentGameConfig.name}</span>
                                            </div>
                                            {preds.length > 0 ? (
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {top5.map((num, idx) => (
                                                        <span
                                                            key={num}
                                                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[11px] font-black border transition-transform hover:scale-110 shadow-xs ${
                                                                idx === 0 
                                                                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold ring-1 ring-amber-400/40' 
                                                                    : 'bg-surface-2/90 text-foreground border-border/50'
                                                            }`}
                                                        >
                                                            {num}
                                                        </span>
                                                    ))}
                                                    {preds.length > 5 && (
                                                        <span className="text-[10px] text-muted-foreground font-semibold ml-0.5">
                                                            +{preds.length - 5}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-muted-foreground italic py-1">
                                                    Previsão a sincronizar...
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons: Ver Análise & Enviar para GCI */}
                                    <div className="pt-2 border-t border-border/50 flex items-center gap-2">
                                        <Link
                                            href={detailedPageUrl}
                                            className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold text-center bg-surface-2 hover:bg-surface-3 text-foreground border border-border/50 transition-colors flex items-center justify-center gap-1 group/btn"
                                            title={`Ver análise histórica detalhada de ${sys.name} no ${currentGameConfig.name}`}
                                        >
                                            <span>Ver Análise</span>
                                            <span className="text-[9px] group-hover/btn:translate-x-0.5 transition-transform">→</span>
                                        </Link>

                                        <Link
                                            href={gciUrl}
                                            className="py-1.5 px-3 rounded-xl text-[11px] font-bold text-white transition-all flex items-center justify-center gap-1 shadow-xs hover:opacity-95 active:scale-95"
                                            style={{ backgroundColor: currentGameConfig.accent }}
                                            title={`Enviar números de ${sys.name} (${currentGameConfig.name}) para o Gerador de Chaves Inteligente`}
                                        >
                                            <Wand2 className="w-3 h-3" />
                                            <span>GCI</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
