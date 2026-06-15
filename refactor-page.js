const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacementMap = `{
        bg: "bg-game-bg-gradient dark:bg-black",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "glass-card dark:bg-game-card bg-white dark:border-game-border",
        themeColor: "game",
        btn: "bg-game-primary/20 dark:bg-game-primary/40 text-game-primary dark:text-game-text-accent border border-game-primary/50 hover:bg-white dark:hover:bg-zinc-900",
        gradient_light: "from-game-primary/10 via-white/80 to-game-primary/20 dark:from-zinc-900/60 dark:to-game-card",
        accentText: "text-game-primary dark:text-game-text-accent",
        accentBg: "bg-game-primary",
        badge: "bg-game-badge-bg text-game-badge-text border border-game-primary/40",
        textGrad: "bg-clip-text text-transparent bg-gradient-to-r from-game-primary to-game-primary-hover",
        btnActive: "bg-game-primary/20 dark:bg-game-primary/40 text-game-primary dark:text-game-text-accent border border-game-primary/50",
        btnInactive: "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
        rank1: "bg-game-primary/20 dark:bg-game-primary/40 text-game-primary dark:text-game-text-accent border border-game-primary/50",
        jackpotText: "text-game-primary dark:text-game-text-accent"
    }`;

content = content.replace(/const gameThemeMap = \{[\s\S]*?\};\n/g, `const gameThemeMap = {
    [GameType.MEGASENA]: ${replacementMap},
    [GameType.EUROMILLIONS]: ${replacementMap},
    [GameType.TOTOLOTO]: ${replacementMap},
    [GameType.EURODREAMS]: ${replacementMap}
};\n`);

// Add data-game to the main wrapper
content = content.replace(/<div className=\{\`min-h-screen \$\{theme\.bg\}\`\}>/, '<div className={`min-h-screen ${theme.bg}`} data-game={gameKey}>');
content = content.replace(/<main className="container mx-auto px-4 py-8 max-w-7xl">/, '<main className="container mx-auto px-4 py-8 max-w-7xl" data-game={gameKey}>');

fs.writeFileSync(file, content, 'utf8');
console.log('Done refactoring page.tsx');
