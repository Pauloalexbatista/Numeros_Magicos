
import { BackButton } from '@/components/ui';
import { Card } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { getStarSystemDetails, getStarPrediction } from '../../../actions';
import StarSystemStatsViewer from '@/components/analysis/StarSystemStatsViewer';
import SendToWheelingButton from '@/components/SendToWheelingButton';
import { GameType } from '@/types/game';

export const dynamic = 'force-dynamic';

interface Props {
    params: {
        game: string;
        systemName: string;
    }
}

// Map URL param to GameType
const GAME_MAP: Record<string, GameType> = {
    'euromillions': GameType.EUROMILLIONS,
    'totoloto': GameType.TOTOLOTO,
    'eurodreams': GameType.EURODREAMS
};

export default async function StarSystemDetailsPage({ params }: Props) {
    const { game, systemName: encodedName } = await params;
    const systemName = decodeURIComponent(encodedName);

    // Validate Game
    const gameKey = game.toLowerCase();
    const gameType = GAME_MAP[gameKey];
    if (!gameType) notFound();

    const details = await getStarSystemDetails(systemName);

    if (!details) {
        notFound();
    }

    const { system, history } = details;

    // Filter History by Game
    const gameHistory = history.filter(h => h.draw.game === gameType);

    // Fetch NEXT draw prediction
    const nextPrediction = await getStarPrediction(systemName);

    // Calculate distribution for stats (based on game history)
    const distribution = [0, 0, 0]; // [0 hits, 1 hit, 2 hits]
    let totalHits = 0;

    gameHistory.forEach(p => {
        const hits = Math.min(2, Math.max(0, p.hits));
        distribution[hits]++;
        totalHits += hits;
    });

    const accuracy = gameHistory.length > 0
        ? ((totalHits / gameHistory.length) / 2) * 100
        : 0;

    const stats = {
        accuracy,
        totalPredictions: gameHistory.length,
        distribution
    };

    const isTotoloto = gameType === GameType.TOTOLOTO;
    const isEuroDreams = gameType === GameType.EURODREAMS;

    // Theme Configuration (Light Mode)
    // EM: Amber, TL: Emerald, ED: Rose
    const theme = isEuroDreams ? {
        primary: 'rose',
        bg: 'bg-rose-50',
        title: 'text-rose-900',
        subtitle: 'text-rose-600',
        accent: 'rose-600',
        border: 'border-rose-100',
        card: 'bg-white',
        btn: 'bg-rose-100 text-rose-700',
        gradient_light: 'from-rose-50 to-pink-50'
    } : isTotoloto ? {
        primary: 'emerald',
        bg: 'bg-emerald-50',
        title: 'text-emerald-900',
        subtitle: 'text-emerald-600',
        accent: 'emerald-600',
        border: 'border-emerald-100',
        card: 'bg-white',
        btn: 'bg-emerald-100 text-emerald-700',
        gradient_light: 'from-emerald-50 to-green-50'
    } : {
        primary: 'amber', // Yellow for Euromillions
        bg: 'bg-amber-50',
        title: 'text-amber-900',
        subtitle: 'text-amber-600',
        accent: 'amber-600',
        border: 'border-amber-100',
        card: 'bg-white',
        btn: 'bg-amber-100 text-amber-800',
        gradient_light: 'from-amber-50 to-yellow-50'
    };

    const themeColor = isTotoloto ? 'emerald' : isEuroDreams ? 'rose' : 'amber';
    const gradientFrom = isTotoloto ? 'emerald-400' : isEuroDreams ? 'rose-400' : 'amber-400';
    const gradientTo = isTotoloto ? 'teal-600' : isEuroDreams ? 'pink-600' : 'orange-500';

    return (
        <div className={`min-h-screen ${theme.bg} p-6 pb-24 font-sans`}>
            <div className="container mx-auto space-y-8 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <BackButton href={`/analysis/stars/ranking/${game}`} />
                        <div>
                            <h1 className={`text-3xl font-bold ${theme.title}`}>{system.systemName}</h1>
                            <p className={`${theme.subtitle} opacity-80`}>Sistema de previsão de {isTotoloto ? 'N.º da Sorte' : isEuroDreams ? 'N.º de Sonho' : 'Estrelas'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/analysis/stars/history`}
                            className={`px-4 py-2 ${theme.btn} hover:bg-white border hover:border-${themeColor}-200 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2`}
                        >
                            📊 Análise Histórica
                        </Link>
                    </div>
                </div>

                {/* 📖 EXPLANATION CARD (for new systems) */}
                {['Clustering Stars', 'Monte Carlo Stars', 'Vortex Stars', 'Média +1 Stars'].includes(systemName) && (
                    <Card className={`p-6 bg-white border-${themeColor}-100 shadow-sm`}>
                        <h3 className={`text-lg font-bold text-${themeColor}-700 mb-3 flex items-center gap-2`}>
                            💡 Como Funciona Este Sistema
                        </h3>
                        {systemName === 'Clustering Stars' && (
                            <div className="text-slate-600 space-y-2">
                                <p><strong className={`text-${themeColor}-600`}>Conceito:</strong> Agrupamento inteligente de estrelas em 3 clusters</p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-sm marker:text-slate-400">
                                    <li><strong>Cluster 1:</strong> Estrelas 1-4 (baixas)</li>
                                    <li><strong>Cluster 2:</strong> Estrelas 5-8 (médias)</li>
                                    <li><strong>Cluster 3:</strong> Estrelas 9-12 (altas)</li>
                                </ul>
                                <p className="text-sm"><strong className={`text-${themeColor}-600`}>Lógica:</strong> Analisa qual cluster tem mais atividade histórica e seleciona as 6 estrelas mais frequentes dos clusters mais ativos.</p>
                                <p className="text-xs text-slate-400 mt-2">📊 Ranking: #3 (55.20% accuracy) - Top 3!</p>
                            </div>
                        )}
                        {/* Add other descriptions similarly if needed - keeping structure but light mode text */}
                        {systemName === 'Monte Carlo Stars' && (
                            <div className="text-slate-600 space-y-2">
                                <p><strong className={`text-${themeColor}-600`}>Conceito:</strong> Simulações probabilísticas avançadas</p>
                                <p className="text-sm"><strong className={`text-${themeColor}-600`}>Lógica:</strong> Executa 1000 sorteios simulados baseados na frequência histórica ponderada.</p>
                            </div>
                        )}
                    </Card>
                )}

                {/* 🔮 NEXT PREDICTION CARD (Highlighted) */}
                <Card className={`p-8 bg-gradient-to-br ${theme.gradient_light} border border-${themeColor}-100 shadow-sm relative overflow-hidden group`}>
                    <div className={`absolute top-0 right-0 p-4 text-${themeColor}-200/50 group-hover:text-${themeColor}-200 transition-colors`}>
                        <span className="text-9xl">🔮</span>
                    </div>

                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h2 className={`text-xl font-bold text-${themeColor}-800 flex items-center gap-2`}>
                            <span className="animate-pulse">✨</span> Próxima Previsão
                        </h2>
                        {nextPrediction && nextPrediction.length > 0 && (
                            <SendToWheelingButton
                                stars={nextPrediction}
                                label="Enviar para Desdobramentos"
                                className={`bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 shadow-sm border-none`}
                            />
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start relative z-10">
                        {nextPrediction && nextPrediction.length > 0 ? (
                            nextPrediction.map((star: number) => (
                                <div key={star} className="relative group/star">
                                    <div className={`absolute inset-0 bg-${themeColor}-400/20 rounded-full blur-md group-hover/star:blur-lg transition-all`}></div>
                                    <div className={`
                                        relative w-12 h-12 flex items-center justify-center rounded-2xl text-lg font-bold shadow-sm transition-transform group-hover/star:scale-110
                                        bg-white text-${themeColor}-700 border border-${themeColor}-200
                                    `}>
                                        {star}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={`text-${themeColor}-400 italic`}>Calculando previsão...</div>
                        )}
                    </div>
                </Card>

                {/* 🔥 STATISTICS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Accuracy Card */}
                    <Card className="p-6 bg-white border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🎯</span>
                            <h3 className="text-lg font-bold text-slate-800">Precisão Global</h3>
                        </div>
                        <div className={`text-4xl font-black ${stats.accuracy >= 50 ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {stats.accuracy.toFixed(1)}%
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Baseado em {stats.totalPredictions} sorteios</p>
                    </Card>

                    {/* Distribution Card - Minified for layout */}
                    <Card className="p-6 bg-white border-slate-200 shadow-sm col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">📊</span>
                            <h3 className="text-lg font-bold text-slate-800">Distribuição de Acertos</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {[0, 1, 2].map(hits => (
                                <div key={hits} className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">{hits} Acerto(s)</div>
                                    <div className={`text-2xl font-bold ${hits === 2 ? `text-${themeColor}-600` : 'text-slate-700'}`}>
                                        {stats.distribution[hits]}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        {Math.round((stats.distribution[hits] / stats.totalPredictions) * 100)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Interactive Stats Viewer - Pass game prop for styling inside */}
                <StarSystemStatsViewer
                    systemName={systemName}
                    initialStats={{
                        accuracy: stats.accuracy,
                        total: stats.totalPredictions,
                        distribution: stats.distribution
                    }}
                    isActive={true}
                    game={gameType}
                />

                {/* Note: StarSystemStatsViewer likely needs internal Light Mode updates too. 
                   Since it's a client component, I need to check it separately. 
                   For now, the page wrapper provides the background so it won't look totally broken,
                   but the component itself might have hardcoded dark styles.
                */}
            </div>
            <ResponsibleGamingFooter className="opacity-70 mt-12 pt-8 border-t border-slate-200" />
        </div>
    );
}
