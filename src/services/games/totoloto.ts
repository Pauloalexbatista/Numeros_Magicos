
import { GameType } from '@/types/game';
import { GameFactory } from '@/systems/core/GameFactory';
import { HotNumbersSystem } from '@/systems/stats/HotNumbersSystem';

export class TotolotoService {
    private gameType = GameType.TOTOLOTO;

    async runPredictions() {
        console.log(`Starting predictions for ${this.gameType}...`);

        // 1. Get Config
        const config = GameFactory.getConfig(this.gameType);

        // 2. Instantiate Systems
        // In the future, GameFactory.createSystems(this.gameType) will do this
        const systems = [
            new HotNumbersSystem(config)
        ];

        // 3. Mock History (for now)
        const mockHistory = [];

        // 4. Run Predictions
        for (const system of systems) {
            console.log(`Running ${system.metadata.name}...`);
            const prediction = await system.predict(mockHistory);
            console.log(`Prediction: ${prediction.numbers.join(', ')}`);
        }
    }
}
