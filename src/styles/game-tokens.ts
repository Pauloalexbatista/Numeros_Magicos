import { GameType } from '@/types/game';

export type GameTokenSet = {
    surface: string;
    surfaceAlt: string;
    accent: string;
    accent2: string;
    accentMuted: string;
    accentBorder: string;
    bg: string;
    text: string;
    border: string;
    glow: string;
    ballBg: string;
    ballText: string;
    starBg: string;
    starText: string;
    gradient: string;
};

export const gameTokens: Record<GameType, GameTokenSet> = {
    [GameType.EUROMILLIONS]: {
        surface: 'var(--euro-surface)',
        surfaceAlt: 'var(--euro-bg)',
        accent: 'var(--euro-accent)',
        accent2: 'var(--euro-accent-2)',
        accentMuted: 'rgba(74,143,231,0.18)',
        accentBorder: 'var(--euro-border)',
        bg: 'var(--euro-bg)',
        text: 'var(--euro-text)',
        border: 'rgba(255,255,255,0.10)',
        glow: 'var(--euro-glow)',
        ballBg: 'var(--euro-ball-bg)',
        ballText: 'var(--euro-ball-text)',
        starBg: 'var(--euro-star-bg)',
        starText: 'var(--euro-star-text)',
        gradient: 'var(--euro-gradient)',
    },
    [GameType.TOTOLOTO]: {
        surface: 'var(--toto-surface)',
        surfaceAlt: 'var(--toto-bg)',
        accent: 'var(--toto-accent)',
        accent2: 'var(--toto-accent-2)',
        accentMuted: 'rgba(34,197,94,0.18)',
        accentBorder: 'var(--toto-border)',
        bg: 'var(--toto-bg)',
        text: 'var(--toto-text)',
        border: 'rgba(255,255,255,0.10)',
        glow: 'var(--toto-glow)',
        ballBg: 'var(--toto-ball-bg)',
        ballText: 'var(--toto-ball-text)',
        starBg: 'var(--toto-surface)',
        starText: 'var(--toto-accent-2)',
        gradient: 'var(--toto-gradient)',
    },
    [GameType.EURODREAMS]: {
        surface: 'var(--dream-surface)',
        surfaceAlt: 'var(--dream-bg)',
        accent: 'var(--dream-accent)',
        accent2: 'var(--dream-accent-2)',
        accentMuted: 'rgba(168,85,247,0.18)',
        accentBorder: 'var(--dream-border)',
        bg: 'var(--dream-bg)',
        text: 'var(--dream-text)',
        border: 'rgba(255,255,255,0.10)',
        glow: 'var(--dream-glow)',
        ballBg: 'var(--dream-ball-bg)',
        ballText: 'var(--dream-ball-text)',
        starBg: 'var(--dream-surface)',
        starText: 'var(--dream-accent-2)',
        gradient: 'var(--dream-gradient)',
    },
    [GameType.MEGASENA]: {
        surface: 'var(--mega-surface)',
        surfaceAlt: 'var(--mega-bg)',
        accent: 'var(--mega-accent)',
        accent2: 'var(--mega-accent-2)',
        accentMuted: 'rgba(245,158,11,0.18)',
        accentBorder: 'var(--mega-border)',
        bg: 'var(--mega-bg)',
        text: 'var(--mega-text)',
        border: 'rgba(255,255,255,0.10)',
        glow: 'var(--mega-glow)',
        ballBg: 'var(--mega-ball-bg)',
        ballText: 'var(--mega-ball-text)',
        starBg: 'var(--mega-surface)',
        starText: 'var(--mega-accent-2)',
        gradient: 'var(--mega-gradient)',
    },
};
