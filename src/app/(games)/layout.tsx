import { ReactNode } from 'react';

interface GamesLayoutProps {
    children: ReactNode;
}

/**
 * Shared layout for game pages (EuroMillions, Totoloto, EuroDreams)
 * This layout wraps all game-specific pages and can include:
 * - Game selector navigation
 * - Shared styling
 * - Common components
 */
export default function GamesLayout({ children }: GamesLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            {/* Game Selector could be added here in the future */}
            {/* <div className="container mx-auto px-4 py-4">
                <GameSelector />
            </div> */}

            {/* Main content */}
            <div className="container mx-auto px-4 py-8">
                {children}
            </div>
        </div>
    );
}
