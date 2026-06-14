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
    ui: {
        accent: string;
        gradient: string;
        flag: string;
        themeGrad: string;
    }
}

export const GAMES: Record<GameType, GameConfig> = {
    [GameType.EUROMILLIONS]: {
        id: GameType.EUROMILLIONS,
        name: 'Euromilhões',
        slug: 'euromillions',
        rules: {
            mainCount: 5,
            mainRange: 50,
            bonusCount: 2,
            bonusRange: 12,
            bonusLabel: 'Estrelas'
        },
        ui: {
            accent: 'var(--euro-accent)',
            gradient: 'linear-gradient(180deg, rgba(59,130,246,0.07), rgba(147,197,253,0.03) 60%, transparent 100%)',
            flag: '挧',
            themeGrad: 'from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-400'
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
        },
        ui: {
            accent: 'var(--toto-accent)',
            gradient: 'linear-gradient(180deg, rgba(34,197,94,0.07), rgba(134,239,172,0.03) 60%, transparent 100%)',
            flag: '曔',
            themeGrad: 'from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400'
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
        },
        ui: {
            accent: 'var(--dream-accent)',
            gradient: 'linear-gradient(180deg, rgba(168,85,247,0.07), rgba(216,180,254,0.03) 60%, transparent 100%)',
            flag: '挧',
            themeGrad: 'from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400'
        }
    }
};