import { GameType } from '@/types/game';

/**
 * Game theme configuration
 * Provides color palettes and gradients for each game
 */

export interface GameTheme {
    id: GameType;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        light: string;
        dark: string;
    };
    gradient: {
        from: string;
        to: string;
        css: string;
    };
    textGradient: string;
    borderColor: string;
    hoverBorder: string;
}

/**
 * Game themes configuration
 */
export const GAME_THEMES: Record<GameType, GameTheme> = {
    [GameType.EUROMILLIONS]: {
        id: GameType.EUROMILLIONS,
        name: 'Euromilhões',
        colors: {
            primary: '#3b82f6',      // blue-500
            secondary: '#2563eb',    // blue-600
            accent: '#fbbf24',       // amber-400 (gold for stars)
            light: '#dbeafe',        // blue-100
            dark: '#1e40af'          // blue-800
        },
        gradient: {
            from: '#1e40af',         // blue-800
            to: '#3b82f6',           // blue-500
            css: 'from-euro-800 to-euro-500'
        },
        textGradient: 'from-blue-400 to-indigo-400',
        borderColor: 'border-euro-500',
        hoverBorder: 'hover:border-euro-400'
    },

    [GameType.TOTOLOTO]: {
        id: GameType.TOTOLOTO,
        name: 'Totoloto',
        colors: {
            primary: '#10b981',      // emerald-500
            secondary: '#059669',    // emerald-600
            accent: '#4ade80',       // green-400 (clover)
            light: '#d1fae5',        // emerald-100
            dark: '#065f46'          // emerald-800
        },
        gradient: {
            from: '#059669',         // emerald-600
            to: '#10b981',           // emerald-500
            css: 'from-toto-600 to-toto-500'
        },
        textGradient: 'from-green-400 to-emerald-400',
        borderColor: 'border-toto-500',
        hoverBorder: 'hover:border-toto-400'
    },

    [GameType.EURODREAMS]: {
        id: GameType.EURODREAMS,
        name: 'EuroDreams',
        colors: {
            primary: '#a855f7',      // purple-500
            secondary: '#9333ea',    // purple-600
            accent: '#fcd34d',       // amber-300 (stars/moon)
            light: '#f3e8ff',        // purple-100
            dark: '#7c3aed'          // purple-700
        },
        gradient: {
            from: '#7c3aed',         // purple-700
            to: '#ec4899',           // pink-500
            css: 'from-dream-700 to-pink-500'
        },
        textGradient: 'from-purple-400 to-pink-400',
        borderColor: 'border-dream-500',
        hoverBorder: 'hover:border-dream-400'
    }
};

/**
 * Get theme configuration for a specific game
 */
export function getGameTheme(game: GameType): GameTheme {
    return GAME_THEMES[game];
}

/**
 * Get gradient CSS classes for a game
 */
export function getGameGradient(game: GameType): string {
    const theme = getGameTheme(game);
    return `bg-gradient-to-r ${theme.gradient.css}`;
}

/**
 * Get text gradient CSS classes for a game
 */
export function getGameTextGradient(game: GameType): string {
    const theme = getGameTheme(game);
    return `bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`;
}

/**
 * Get primary color for a game
 */
export function getGameColor(game: GameType): string {
    const theme = getGameTheme(game);
    return theme.colors.primary;
}

/**
 * Get border color classes for a game
 */
export function getGameBorderColor(game: GameType): string {
    const theme = getGameTheme(game);
    return `${theme.borderColor} ${theme.hoverBorder}`;
}

/**
 * Get icon/emoji for a game
 */
export function getGameIcon(game: GameType): string {
    switch (game) {
        case GameType.EUROMILLIONS:
            return '🇪🇺';
        case GameType.TOTOLOTO:
            return '🇵🇹';
        case GameType.EURODREAMS:
            return '✨';
        default:
            return '🎲';
    }
}

/**
 * Get full theme classes for a card/component
 */
export function getGameCardClasses(game: GameType): string {
    const theme = getGameTheme(game);
    return `
    bg-zinc-900/50 
    border 
    ${theme.borderColor} 
    ${theme.hoverBorder}
    hover:shadow-lg 
    hover:shadow-${game.toLowerCase()}-500/20
    transition-all 
    duration-300
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Get button classes for a game
 */
export function getGameButtonClasses(game: GameType, variant: 'primary' | 'outline' = 'primary'): string {
    const theme = getGameTheme(game);

    if (variant === 'outline') {
        return `
      border-2 
      ${theme.borderColor} 
      text-${game.toLowerCase()}-500
      hover:bg-${game.toLowerCase()}-500/10
      ${theme.hoverBorder}
    `.trim().replace(/\s+/g, ' ');
    }

    return `
    bg-${game.toLowerCase()}-500 
    hover:bg-${game.toLowerCase()}-600
    text-white
    shadow-lg 
    shadow-${game.toLowerCase()}-500/30
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Export theme constants for direct use
 */
export const THEME_CONSTANTS = {
    EUROMILLIONS: {
        PRIMARY: 'text-euro-500',
        BG: 'bg-euro-500',
        BORDER: 'border-euro-500',
        GRADIENT: 'bg-gradient-euro',
        TEXT_GRADIENT: 'text-gradient-euro',
        HOVER_BG: 'hover:bg-euro-600',
        HOVER_TEXT: 'hover:text-euro-400',
        HOVER_BORDER: 'hover:border-euro-400'
    },
    TOTOLOTO: {
        PRIMARY: 'text-toto-500',
        BG: 'bg-toto-500',
        BORDER: 'border-toto-500',
        GRADIENT: 'bg-gradient-toto',
        TEXT_GRADIENT: 'text-gradient-toto',
        HOVER_BG: 'hover:bg-toto-600',
        HOVER_TEXT: 'hover:text-toto-400',
        HOVER_BORDER: 'hover:border-toto-400'
    },
    EURODREAMS: {
        PRIMARY: 'text-dream-500',
        BG: 'bg-dream-500',
        BORDER: 'border-dream-500',
        GRADIENT: 'bg-gradient-dream',
        TEXT_GRADIENT: 'text-gradient-dream',
        HOVER_BG: 'hover:bg-dream-600',
        HOVER_TEXT: 'hover:text-dream-400',
        HOVER_BORDER: 'hover:border-dream-400'
    }
} as const;
