
import { ISystem } from './core/types';
import { HotNumbersSystem } from './stats/HotNumbersSystem';
import { MarkovSystem } from './stats/MarkovSystem';
import { MonteCarloSystem } from './stats/MonteCarloSystem';
import { ClusteringSystem } from './stats/ClusteringSystem';
import { PyramidPascalSystem } from './pyramids/PyramidPascalSystem';
import { PyramidGapsSystem } from './pyramids/PyramidGapsSystem';
import { VortexPyramidSystem } from './pyramids/VortexPyramidSystem';
import { RandomForestSystem } from './ml/RandomForestSystem';
import { LSTMSystem } from './ml/LSTMSystem';
import { GoldSystem, SilverSystem, BronzeSystem, PlatinumSystem } from './ensemble/MedalSystem';
import { QuartetoEliteSystem } from './ensemble/QuartetoEliteSystem';
import { GameFactory } from './core/GameFactory';
import { GameType } from '@/types/game';
// Import other systems here as we migrate them...

export const SystemRegistry: ISystem[] = [
    new HotNumbersSystem(GameFactory.getConfig(GameType.EUROMILLIONS)),
    new MarkovSystem(),
    new MonteCarloSystem(),
    new ClusteringSystem(),
    new PyramidPascalSystem(),
    new PyramidGapsSystem(),
    new VortexPyramidSystem(),
    new RandomForestSystem(),
    new LSTMSystem(),
    new GoldSystem(),
    new SilverSystem(),
    new BronzeSystem(),
    new PlatinumSystem(),
    new QuartetoEliteSystem(),
];

export function getSystemByName(name: string): ISystem | undefined {
    return SystemRegistry.find(s => s.metadata.name === name);
}

export function getActiveSystems(): ISystem[] {
    // In a real scenario, we might filtering by config/env, 
    // but for now we return all registered systems that claim to be active by default
    // or we will filter via DB later.
    return SystemRegistry;
}
