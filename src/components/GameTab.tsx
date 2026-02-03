'use client';

import { GameType } from '@/types/game';
import { getGameTheme, getGameIcon } from '@/utils/game-theme';
import { cn } from '@/lib/utils';

interface GameTabProps {
    game: GameType;
    isActive: boolean;
    onClick: () => void;
}

/**
 * Individual game tab component
 * Displays game icon, name and applies theme colors
 */
export default function GameTab({ game, isActive, onClick }: GameTabProps) {
    const theme = getGameTheme(game);
    const icon = getGameIcon(game);
    const gamePrefix = game.toLowerCase();

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                "border-2",
                isActive
                    ? `bg-${gamePrefix}-500 border-${gamePrefix}-500 text-white shadow-lg shadow-${gamePrefix}-500/30`
                    : `border-${gamePrefix}-200 dark:border-${gamePrefix}-800 text-${gamePrefix}-700 dark:text-${gamePrefix}-300 hover:bg-${gamePrefix}-50 dark:hover:bg-${gamePrefix}-900/20`
            )}
        >
            <span className="text-xl">{icon}</span>
            <span className="hidden sm:inline-block">{theme.name}</span>
        </button>
    );
}
