import React from 'react';
import LinkCard from '@/components/dashboard/LinkCard';
import LatestDrawWidget from '@/components/dashboard/LatestDrawWidget';
import DisclaimerWidget from '@/components/dashboard/DisclaimerWidget';
import HistoryWidget from '@/components/dashboard/HistoryWidget';
import RankingSummaryWidget from '@/components/dashboard/RankingSummaryWidget';
import StarPredictionWidget from '@/components/dashboard/StarPredictionWidget';
import RecommendedBetWidget from '@/components/dashboard/RecommendedBetWidget';
import TopStarSystemsWidget from '@/components/dashboard/TopStarSystemsWidget';
import { LSTMClient } from '@/components/LSTMClient';
import { AnalysisClient } from '@/components/AnalysisClient';
import { GoldSystemClient } from '@/components/GoldSystemClient';
import { SilverSystemClient } from '@/components/SilverSystemClient';
import { BronzeSystemClient } from '@/components/BronzeSystemClient';
import { MeanAmplitudeClient } from '@/components/MeanAmplitudeClient';
import { StandardDeviationClient } from '@/components/StandardDeviationClient';
import { PatternBasedClient } from '@/components/PatternBasedClient';
import { MLClassifierClient } from '@/components/MLClassifierClient';
import { RandomForestClient } from '@/components/RandomForestClient';
import { ExplanationCard } from '@/components/ExplanationCard';

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
    'LSTMClient': { component: LSTMClient },
    'AnalysisClient': { component: AnalysisClient },
    'GoldSystemClient': { component: GoldSystemClient },
    'SilverSystemClient': { component: SilverSystemClient },
    'BronzeSystemClient': { component: BronzeSystemClient },
    'MeanAmplitudeClient': { component: MeanAmplitudeClient },
    'StandardDeviationClient': { component: StandardDeviationClient },
    'PatternBasedClient': { component: PatternBasedClient },
    'MLClassifierClient': { component: MLClassifierClient },
    'RandomForestClient': { component: RandomForestClient },
    'ExplanationCard': { component: ExplanationCard },
    'MeanReversionCard': { component: MeanReversionCard }
};

export const getComponent = (key: string) => {
    return componentRegistry[key];
};
