
import { GameType, GameConfig, GAMES } from '@/types/game';
import { ISystem } from './types';
// We will import specific systems here or use a registry pattern
// For now, we will return an empty list or a basic set of systems to avoid circular deps

export class GameFactory {
    static getConfig(game: GameType): GameConfig {
        return GAMES[game];
    }

    /**
     * Returns the list of active systems for a specific game.
     * This will be the entry point for the "Update Orchestrator".
     */
    static createSystems(game: GameType): ISystem[] {
        const config = this.getConfig(game);

        // TODO: Instantiate systems with this config
        // e.g. return [ new HotNumbersSystem(config), ... ]

        const systems: ISystem[] = [];
        return systems;
    }
}
