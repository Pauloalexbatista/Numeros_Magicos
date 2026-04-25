import React from 'react';
import LinkCard from '@/components/dashboard/LinkCard';
import LatestDrawWidget from '@/components/dashboard/LatestDrawWidget';
import DisclaimerWidget from '@/components/dashboard/DisclaimerWidget';
import HistoryWidget from '@/components/dashboard/HistoryWidget';
import RankingSummaryWidget from '@/components/dashboard/RankingSummaryWidget';
import StarPredictionWidget from '@/components/dashboard/StarPredictionWidget';
import RecommendedBetWidget from '@/components/dashboard/RecommendedBetWidget';
import TopStarSystemsWidget from '@/components/dashboard/TopStarSystemsWidget';
import AnalysisClient from '@/components/AnalysisClient';
import MeanAmplitudeClient from '@/components/MeanAmplitudeClient';
import StandardDeviationClient from '@/components/StandardDeviationClient';
import PatternBasedClient from '@/components/PatternBasedClient';
import ExplanationCard from '@/components/ExplanationCard';

import MeanReversionCard from '@/components/MeanReversionCard';

export type ComponentRegistryItem = {
    component: React.ComponentType<any>;
    defaultProps?: any;
};

export const componentRegistry: Record<string, ComponentRegistryItem> = {
    'LinkCard': { component: LinkCard },
    'LatestDrawWidget': { component: LatestDrawWidget },
    'DisclaimerWidget': { component: DisclaimerWidget },
    'HistoryWidget': { component: HistoryWidget },
    'RankingSummaryWidget': { component: RankingSummaryWidget },
    'StarPredictionWidget': { component: StarPredictionWidget },
    'RecommendedBetWidget': { component: RecommendedBetWidget },
    'TopStarSystemsWidget': { component: TopStarSystemsWidget },
    'AnalysisClient': { component: AnalysisClient },
    'MeanAmplitudeClient': { component: MeanAmplitudeClient },
    'StandardDeviationClient': { component: StandardDeviationClient },
    'PatternBasedClient': { component: PatternBasedClient },
    'ExplanationCard': { component: ExplanationCard },
    'MeanReversionCard': { component: MeanReversionCard }
};

export const getComponent = (key: string) => {
    return componentRegistry[key];
};
