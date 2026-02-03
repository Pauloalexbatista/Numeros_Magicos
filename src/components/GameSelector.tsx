'use client';

import { useState } from 'react';
import { GameType } from '@/types/game';
import GameTab from './GameTab';

interface GameSelectorProps {
    currentGame?: GameType;
    onGameChange?: (game: GameType) => void;
    className?: string;
}

/**
 * Game selector component
 * Displays tabs for all available games and manages active state
 */
export default function GameSelector({
    currentGame = GameType.EUROMILLIONS,
    onGameChange,
    className = ''
}: GameSelectorProps) {
    const [activeGame, setActiveGame] = useState<GameType>(currentGame);

    const games: GameType[] = [
        GameType.EUROMILLIONS,
        GameType.TOTOLOTO,
        GameType.EURODREAMS
    ];

    const handleGameClick = (game: GameType) => {
        setActiveGame(game);
        onGameChange?.(game);
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {games.map((game) => (
                <GameTab
                    key={game}
                    game={game}
                    isActive={activeGame === game}
                    onClick={() => handleGameClick(game)}
                />
            ))}
        </div>
    );
}
