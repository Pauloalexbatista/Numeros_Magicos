const fs = require('fs');

const filesToUpdate = [
    'src/app/ranking/[game]/page.tsx',
    'src/app/ranking/[game]/[systemName]/page.tsx',
    'src/app/analysis/stars/ranking/[game]/page.tsx',
    'src/app/analysis/stars/ranking/[game]/[systemName]/page.tsx'
];

function updateFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('import { GAMES } from')) {
        content = content.replace(/import \{ GameType \} from ['"]@\/types\/game['"];/, "import { GameType, GAMES } from '@/types/game';");
    }

    content = content.replace(/const gameThemeMap = \{[\s\S]*?\};\n/, '');

    const themeReplacement = `
    const gameConfig = Object.values(GAMES).find(g => g.slug === gameKey);
    const currentTheme = gameConfig ? {
        textGrad: gameConfig.ui.themeGrad,
        btnActive: "bg-accent/10 dark:bg-accent/20 text-accent font-bold border border-accent/50",
        rank1: "bg-accent text-white border border-accent/50 shadow-[0_0_15px_var(--accent-muted)]",
        jackpotText: "text-accent font-extrabold"
    } : {
        textGrad: "from-blue-600 to-indigo-700",
        btnActive: "bg-surface-2 text-foreground",
        rank1: "bg-surface-3 text-foreground",
        jackpotText: "text-foreground"
    };
    `;

    // Replace async pattern
    content = content.replace(/const gameKey = \(await params\)\.game\.toLowerCase\(\);\s*const gameType = GAME_MAP\[gameKey\] \|\| GameType\.EUROMILLIONS;\s*const currentTheme = gameThemeMap\[gameType\];/, 
        `const gameKey = (await params).game.toLowerCase();
    const gameType = GAME_MAP[gameKey] || GameType.EUROMILLIONS;
    ` + themeReplacement
    );

    // Replace non-async pattern
    content = content.replace(/const gameKey = params\.game\.toLowerCase\(\);\s*const gameType = GAME_MAP\[gameKey\] \|\| GameType\.EUROMILLIONS;\s*const currentTheme = gameThemeMap\[gameType\];/, 
        `const gameKey = params.game.toLowerCase();
    const gameType = GAME_MAP[gameKey] || GameType.EUROMILLIONS;
    ` + themeReplacement
    );

    content = content.replace(/<div className="min-h-screen([^"]*)">/, 
        `<div className="min-h-screen$1 transition-all duration-500" style={{
            "--accent": gameConfig?.ui.accent,
            "--accent-hover": "color-mix(in srgb, " + gameConfig?.ui.accent + " 80%, white)",
            "--accent-muted": "color-mix(in srgb, " + gameConfig?.ui.accent + " 15%, transparent)",
            "--accent-border": "color-mix(in srgb, " + gameConfig?.ui.accent + " 30%, transparent)",
        } as React.CSSProperties}>`
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
}

filesToUpdate.forEach(updateFile);
