
import { GameType, GameConfig } from '@/types/game';

export interface IGameService {
    /**
     * Fetches the latest draw from the external provider.
     * Does NOT update the database.
     */
    fetchLatest(): Promise<any>;

    /**
     * Main entry point:
     * 1. Checks for missing draws (gap filling)
     * 2. Fetches latest draw
     * 3. Updates database if new data is found
     * 4. Triggers ranking updates and cache regeneration
     * @returns true if new data was added, false otherwise
     */
    updateDatabase(): Promise<boolean>;

    /**
     * Seed historical data from a specific year.
     * @param year The year to fetch
     */
    seedFromArchive(year: number): Promise<number>;
}
