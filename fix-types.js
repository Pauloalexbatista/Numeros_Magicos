const fs = require('fs');

const files = [
    'src/app/analysis/stars/ranking/[game]/page.tsx',
    'src/app/analysis/stars/ranking/[game]/[systemName]/page.tsx',
    'src/app/ranking/[game]/[systemName]/page.tsx'
];

const badBlock = `[GameType.MEGASENA]: {
        textGrad: 'from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300',
        btnActive: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50',
        rank1: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50',
        jackpotText: 'text-amber-600 dark:text-amber-400',
    },`;

const goodBlock = `[GameType.MEGASENA]: {
        bg: "bg-gradient-to-br from-amber-50/30 via-slate-50 to-yellow-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-amber-950/10",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "bg-card/50 backdrop-blur-sm border border-border backdrop-blur-md shadow-sm",
        themeColor: "amber",
        btn: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 hover:bg-white dark:hover:bg-zinc-900",
        gradient_light: "from-amber-50/40 via-white/80 to-yellow-50/40 dark:from-zinc-900/60 dark:to-amber-950/30",
        accentText: "text-amber-600 dark:text-amber-400",
        accentBg: "bg-amber-500",
        badge: "bg-amber-500/10 text-amber-700 dark:text-amber-450 border border-amber-200/40"
    },`;

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes(badBlock)) {
            content = content.replace(badBlock, goodBlock);
            fs.writeFileSync(file, content, 'utf8');
            console.log("Fixed " + file);
        } else {
            console.log("No bad block in " + file);
        }
    }
}
