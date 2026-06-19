
import { IPredictiveSystem, rankedSystems } from './ranked-systems';
import { StarSystem, starSystems } from './star-systems';
import { Draw } from '@prisma/client';

export class TotolotoSystemWrapper implements IPredictiveSystem {
    name: string;
    description: string;
    private base: IPredictiveSystem;

    constructor(base: IPredictiveSystem) {
        this.base = base;
        this.name = base.name;
        this.description = base.description;
    }

    async generateTop10(draws: Draw[], returnFullPool?: boolean): Promise<number[]> {
        return this.base.generateTop10(draws);
    }
}

export class TotolotoStarSystemWrapper implements StarSystem {
    name: string;
    description: string;
    type: 'base' | 'neural' | 'ensemble';
    domain: 'stars' | 'numbers';
    private base: StarSystem;

    constructor(base: StarSystem) {
        this.base = base;
        this.name = base.name;
        this.description = base.description;
        this.type = 'base';
        this.domain = 'stars';
    }

    generatePrediction(history: Draw[]): Promise<number[]> | number[] {
        return this.base.generatePrediction(history);
    }
}

// Export wrapped systems
export const totolotoRankedSystems: IPredictiveSystem[] = rankedSystems.map(s => new TotolotoSystemWrapper(s));
export const totolotoStarSystems: StarSystem[] = starSystems.map(s => new TotolotoStarSystemWrapper(s));
