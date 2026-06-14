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
        <div className="min-h-screen bg-surface-1 text-foreground font-sans">
            {/* Game Selector could be added here in the future */}
            {/* <div className="container mx-auto px-4 py-4">
                <GameSelector />
            </div> */}

            {/* Main content */}
            <div className="mx-auto max-w-7xl px-4 py-4 md:py-8">
                {children}
            </div>
        </div>
    );
}
