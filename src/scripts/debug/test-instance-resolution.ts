
import { rankedSystems } from '../../services/ranked-systems';
import { starSystems } from '../../services/star-systems';
import {
    totolotoRankedSystems,
    totolotoStarSystems,
    euroDreamsRankedSystems,
    euroDreamsStarSystems
} from '../../services/ranking';

const getInstance = (name: string) => {
    // Search in all game groups
    const em = (rankedSystems as any[]).find((s: any) => s.name === name);
    if (em) return { instance: em, isStars: false, source: 'EM' };

    const emStars = (starSystems as any[]).find((s: any) => s.name === name);
    if (emStars) return { instance: emStars, isStars: true, source: 'EM Stars' };

    const tl = (totolotoRankedSystems as any[]).find((s: any) => s.name === name);
    if (tl) return { instance: tl, isStars: false, source: 'TL' };

    const tlStars = (totolotoStarSystems as any[]).find((s: any) => s.name === name);
    if (tlStars) return { instance: tlStars, isStars: true, source: 'TL Stars' };

    const ed = (euroDreamsRankedSystems as any[]).find((s: any) => s.name === name);
    if (ed) return { instance: ed, isStars: false, source: 'ED' };

    const edStars = (euroDreamsStarSystems as any[]).find((s: any) => s.name === name);
    if (edStars) return { instance: edStars, isStars: true, source: 'ED Stars' };

    return null;
};

console.log('Testing getInstance for Clustering...');
const clustering = getInstance('Clustering');
console.log('Clustering:', clustering ? `Found in ${clustering.source}` : 'NULL');

console.log('Testing getInstance for Clustering_EURODREAMS...');
const clusteringED = getInstance('Clustering_EURODREAMS');
console.log('Clustering_EURODREAMS:', clusteringED ? `Found in ${clusteringED.source}` : 'NULL - POTENTIAL FAILURE');

console.log('\nTesting getInstance for Anti-Clustering...');
const antiClustering = getInstance('Anti-Clustering');
console.log('Anti-Clustering:', antiClustering ? `Found in ${antiClustering.source}` : 'NULL - CONFIRMED FAILURE');
