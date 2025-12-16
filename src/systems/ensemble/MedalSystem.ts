
import { Draw, PrismaClient } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';
import { ensure25 } from '../utils/helpers';
// Circular Dependency Avoidance: We will import SystemRegistry inside the method or use a getter if possible.
// Better yet, we will rely on the `SystemRegistry` export but might need to handle the import order carefully.
// For now, let's assume we can import it. If cycle detected, we switch to dynamic import.
import { SystemRegistry } from '../index';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
        }
    }
});

abstract class MedalSystem implements ISystem {
    abstract metadata: ISystemMetadata;
    protected abstract topN: number;

    async predict(history: Draw[]): Promise<IPredictionResult> {
        // Default weights (fallback)
        let weights: Record<string, number> = {};

        try {
            // Fetch dynamic rankings from DB
            // In a real Offline architecture, this should perhaps read from the `rankings-metrics.json` file 
            // to be truly "offline" and not depend on DB during generation?
            // However, the DB is the source of truth for the *previous* run's performance.
            // Let's keep DB access for now as it's the standard flow.

            const rankings = await prisma.systemRanking.findMany({
                orderBy: { avgAccuracy: 'desc' },
                take: this.topN
            });

            if (rankings.length > 0) {
                rankings.forEach(rank => {
                    // Weight = Accuracy / 50 (simple weighted voting)
                    weights[rank.systemName] = rank.avgAccuracy / 50;
                });
            }
        } catch (error) {
            console.error(`Failed to fetch dynamic rankings for ${this.metadata.name}:`, error);
        }

        const votes: Record<number, number> = {};

        // CRITICAL: Filter out Medal Systems to prevent infinite recursion
        // We use the imported SystemRegistry
        const systems = SystemRegistry.filter(s =>
            !['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina'].includes(s.metadata.name)
        );

        // Filter based on whether they are in our "Top N" weight list?
        // Actually, existing logic filters: `weights[s.name] !== undefined`
        // So we only run the systems that are in the Top N.

        const activeSystems = systems.filter(s => weights[s.metadata.name] !== undefined);

        for (const system of activeSystems) {
            try {
                const systemWeight = weights[system.metadata.name] || 0;
                if (systemWeight === 0) continue;

                // We need to call predict on these sub-systems.
                // RECURSION WARNING: Ensure deeply nested ensembles don't exist. 
                // Currently only 1 level of ensemble exists.

                const result = await system.predict(history);

                result.numbers.forEach(num => {
                    votes[num] = (votes[num] || 0) + systemWeight;
                });
            } catch (error) {
                // Silently fail for individual systems
            }
        }

        const candidates = Object.entries(votes)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        return {
            numbers: ensure25(candidates, history),
            confidence: 0.95 // Ensembles usually have higher confidence
        };
    }
}

export class GoldSystem extends MedalSystem {
    protected topN = 3;
    public metadata: ISystemMetadata = {
        name: "Sistema Ouro",
        description: "Ensemble dos 3 melhores sistemas (Elite)",
        type: 'ENSEMBLE',
        version: '1.0.0',
        isActiveByDefault: true
    };
}

export class SilverSystem extends MedalSystem {
    protected topN = 6;
    public metadata: ISystemMetadata = {
        name: "Sistema Prata",
        description: "Ensemble dos 6 melhores sistemas (Equilibrado)",
        type: 'ENSEMBLE',
        version: '1.0.0',
        isActiveByDefault: true
    };
}

export class BronzeSystem extends MedalSystem {
    protected topN = 9;
    public metadata: ISystemMetadata = {
        name: "Sistema Bronze",
        description: "Ensemble dos 9 melhores sistemas (Diversificado)",
        type: 'ENSEMBLE',
        version: '1.0.0',
        isActiveByDefault: true
    };
}

export class PlatinumSystem extends MedalSystem {
    protected topN = 12;
    public metadata: ISystemMetadata = {
        name: "Sistema Platina",
        description: "Ensemble dos 12 melhores sistemas (Abrangente)",
        type: 'ENSEMBLE',
        version: '1.0.0',
        isActiveByDefault: true
    };
}
