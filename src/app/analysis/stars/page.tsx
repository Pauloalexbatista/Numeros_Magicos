
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';

import { getStarSystemsYearlyAnalysis, getStarFrequency, getStarPairs, getStarProperties, getStarSuggestions } from './actions';
import { TopStarSystemsAnalysis } from '@/components/TopStarSystemsAnalysis';
import { StarFrequencyClient } from '@/components/StarFrequencyClient';
import { StarPairsClient } from '@/components/StarPairsClient';
import { StarPropertiesClient } from '@/components/StarPropertiesClient';
import { StarSuggestionsClient } from '@/components/StarSuggestionsClient';

export const dynamic = 'force-dynamic';

export default async function StarRankingPage() {
    const rankings = await prisma.starSystemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' }
    });

    const yearlyAnalysis = await getStarSystemsYearlyAnalysis();
    const freqData = await getStarFrequency();
    const pairsData = await getStarPairs();
    const propsData = await getStarProperties();
    const suggestionsData = await getStarSuggestions();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-4xl">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
                            Ranking de Estrelas 🌟
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Sistemas especializados na previsão das 2 Estrelas.
                        </p>
                    </div>
                </div>

                {/* Crème de la Crème - Executive Summary */}
                <StarSuggestionsClient suggestions={suggestionsData} />

                {/* New Analysis Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StarPropertiesClient stats={propsData} />
                    <StarFrequencyClient frequency={freqData.frequency} totalDraws={freqData.totalDraws} />
                    <StarPairsClient pairs={pairsData} />
                </div>

                <TopStarSystemsAnalysis data={yearlyAnalysis} />

                <div className="grid gap-4">
                    {rankings.map((rank, index) => (
                        <Card key={rank.id} className="p-6 bg-slate-900/40 border-slate-800 backdrop-blur-sm hover:bg-slate-800/60 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className={`
                                        flex items-center justify-center w-12 h-12 rounded-xl text-xl font-bold shadow-lg
                                        ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black' :
                                            index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black' :
                                                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-black' :
                                                    'bg-slate-800 text-slate-400 border border-slate-700'}
                                    `}>
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            {rank.systemName}
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            {rank.systemName === 'Hot Stars' && 'Baseado na frequência (Quentes)'}
                                            {rank.systemName === 'Late Stars' && 'Baseado no atraso (Frias)'}
                                            {rank.systemName === 'Markov Stars' && 'Baseado em transições'}
                                            {rank.systemName === 'Star Platinum' && 'Ensemble (Combinação)'}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Precisão (Top 4)</div>
                                    <div className="text-3xl font-bold text-yellow-400">
                                        {rank.avgAccuracy.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        Encontra as 2 estrelas vencedoras
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
