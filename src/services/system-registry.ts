
import { IPredictiveSystem } from './ranked-systems';
import { StarSystem } from './star-systems';

// Number Systems Imports
import { generateHotNumbers } from './ranked-systems';
import { generateRecentNumbers } from './ranked-systems';
import { generateLateNumbers } from './ranked-systems';
import { generateMarkovChain } from './ranked-systems';
import { generateClustering } from './ranked-systems';
import {
    PyramidPascalSystem,
    PyramidGapsSystem,
    // SistCombinadoMedia3System, // REMOVED
    // mdiasemaspontasSystem, // REMOVED
    SistMedia3Otimizado,
    // SistMediaCamadas, // REMOVED
    UniversalOscillationV2System
} from './ranked-systems';

// Star Systems Imports
import {
    HotStarsSystem,
    RecentStarsSystem,
    LateStarsSystem,
    MarkovStarsSystem,
    ClusteringStarsSystem,
    PyramidPascalStarsSystem,
    PyramidGapsStarsSystem,
    // SistCombinadoMedia3StarsSystem, // REMOVED
    // MdiaSemasPontasStarsSystem, // REMOVED
    SistMedia3OtimizadoStarsSystem,
    // SistemaCamadasStarsSystem, // REMOVED
    UniversalOscillationV2StarsSystem
} from './star-systems';

export const BASE_NUMBER_SYSTEMS: IPredictiveSystem[] = [
    {
        name: 'Hot Numbers',
        description: 'Top números mais frequentes',
        generateTop10: generateHotNumbers
    },
    {
        name: 'Recent Numbers',
        description: 'Números mais recentes (únicos) a sair',
        generateTop10: generateRecentNumbers
    },
    {
        name: 'Late Numbers',
        description: 'Números mais atrasados (há mais tempo sem sair)',
        generateTop10: generateLateNumbers
    },
    {
        name: 'Markov Chain',
        description: 'Probabilidades de transição',
        generateTop10: generateMarkovChain
    },
    {
        name: 'Clustering',
        description: 'Agrupamento de padrões',
        generateTop10: generateClustering
    },
    new PyramidPascalSystem(),
    new PyramidGapsSystem(),
    new SistMedia3Otimizado(),
    new UniversalOscillationV2System()
];

export const BASE_STAR_SYSTEMS: StarSystem[] = [
    new HotStarsSystem(),
    new RecentStarsSystem(),
    new LateStarsSystem(),
    new MarkovStarsSystem(),
    new ClusteringStarsSystem(),
    new PyramidPascalStarsSystem(),
    new PyramidGapsStarsSystem(),
    new SistMedia3OtimizadoStarsSystem(),
    new UniversalOscillationV2StarsSystem()
];

export function getSystemNameForGame(baseName: string, game: string): string {
    if (game === 'TOTOLOTO') return `${baseName}_TOTOLOTO`;
    if (game === 'EURODREAMS') return `${baseName} (EuroDreams)`;
    return baseName; // EUROMILLIONS
}
