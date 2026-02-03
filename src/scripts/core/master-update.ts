
import { GAMES, GameType, GameConfig } from '@/types/game';
import { IGameService } from '@/services/interfaces/gameService';
import { EuroMillionsService } from '@/services/euroMillionsService';
import { TotolotoService } from '@/services/totolotoService';
import { EuroDreamsService } from '@/services/euroDreamsService';

// Factory to get correct service
function getGameService(gameId: GameType): IGameService {
    switch (gameId) {
        case GameType.EUROMILLIONS:
            return new EuroMillionsService();
        case GameType.TOTOLOTO:
            return new TotolotoService();
        case GameType.EURODREAMS:
            return new EuroDreamsService();
        default:
            throw new Error(`Service for game ${gameId} not implemented`);
    }
}

async function runUpdate(gameId?: GameType) {
    const gamesToUpdate = gameId ? [GAMES[gameId]] : Object.values(GAMES);

    console.log(`\n==================================================`);
    console.log(`🚀 MASTER UPDATE: TARGETING ${gamesToUpdate.length} GAMES`);
    console.log(`==================================================\n`);

    let successCount = 0;

    for (const game of gamesToUpdate) {
        console.log(`\n🔵 [${game.name}] Starting update process...`);
        try {
            const service = getGameService(game.id);

            // Perform database update
            // This internally handles: fetch, check gap, insert, calculate ranking
            const hasUpdates = await service.updateDatabase();

            if (hasUpdates) {
                console.log(`✅ [${game.name}] Update complete with NEW data.`);
            } else {
                console.log(`ℹ️ [${game.name}] No new data found. Up to date.`);
            }
            successCount++;
        } catch (error) {
            console.error(`❌ [${game.name}] Update FAILED:`, error);
        }
    }

    console.log(`\n==================================================`);
    console.log(`🏁 UPDATE SUMMARY: ${successCount}/${gamesToUpdate.length} games processed.`);
    console.log(`==================================================\n`);
}

// CLI Argument parsing
const args = process.argv.slice(2);
const gameArg = args.find(a => a.startsWith('--game='));
let targetGame: GameType | undefined = undefined;

if (gameArg) {
    const slug = gameArg.split('=')[1].toLowerCase();
    // Find game by slug
    const found = Object.values(GAMES).find(g => g.slug === slug);
    if (found) {
        targetGame = found.id;
    } else {
        console.error(`❌ Game '${slug}' not known. Available: euromillions, totoloto, eurodreams`);
        process.exit(1);
    }
}

runUpdate(targetGame).catch(console.error);
