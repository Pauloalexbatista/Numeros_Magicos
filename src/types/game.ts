
export enum GameType {
    EUROMILLIONS = 'EUROMILLIONS',
    TOTOLOTO = 'TOTOLOTO',
    EURODREAMS = 'EURODREAMS'
}

export interface GameConfig {
    id: GameType;
    name: string;
    slug: string;
    rules: {
        mainCount: number;
        mainRange: number;
        bonusCount: number;
        bonusRange: number;
        bonusLabel: string;
    };
}

export const GAMES: Record<GameType, GameConfig> = {
    [GameType.EUROMILLIONS]: {
        id: GameType.EUROMILLIONS,
        name: 'EuroMillions',
        slug: 'euromillions',
        rules: {
            mainCount: 5,
            mainRange: 50,
            bonusCount: 2,
            bonusRange: 12,
            bonusLabel: 'Estrelas'
        }
    },
    [GameType.TOTOLOTO]: {
        id: GameType.TOTOLOTO,
        name: 'Totoloto',
        slug: 'totoloto',
        rules: {
            mainCount: 5,
            mainRange: 49,
            bonusCount: 1,
            bonusRange: 13,
            bonusLabel: 'Número da Sorte'
        }
    },
    [GameType.EURODREAMS]: {
        id: GameType.EURODREAMS,
        name: 'EuroDreams',
        slug: 'eurodreams',
        rules: {
            mainCount: 6,
            mainRange: 40,
            bonusCount: 1,
            bonusRange: 5,
            bonusLabel: 'Dream Number'
        }
    }
};
