
import { IPredictiveSystem } from './ranked-systems';
import { StarSystem } from './star-systems';
import { Draw } from '@prisma/client';

export class EuroDreamsSystemWrapper implements IPredictiveSystem {
    name: string;
    description: string;
    private base: IPredictiveSystem;

    constructor(base: IPredictiveSystem) {
        this.base = base;
        this.name = `${base.name}_EURODREAMS`;
        this.description = base.description;
    }

    async generateTop10(draws: Draw[]): Promise<number[]> {
        return this.base.generateTop10(draws);
    }
}

export class EuroDreamsStarSystemWrapper implements StarSystem {
    name: string;
    description: string;
    private base: StarSystem;

    constructor(base: StarSystem) {
        this.base = base;
        this.name = `${base.name}_EURODREAMS`;
        this.description = base.description;
    }

    generatePrediction(history: Draw[]): Promise<number[]> | number[] {
        return this.base.generatePrediction(history);
    }
}
