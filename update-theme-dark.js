const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update MEGASENA
content = content.replace(
    'bg: "bg-gradient-to-br from-amber-50/30 via-slate-50 to-yellow-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-amber-950/10"',
    'bg: "bg-gradient-to-br from-amber-50/30 via-slate-50 to-yellow-50/20 dark:from-black dark:via-black dark:to-black"'
);
content = content.replace(
    'card: "glass-card",\n        themeColor: "amber"',
    'card: "glass-card dark:bg-amber-950/30 dark:border-amber-900/50",\n        themeColor: "amber"'
);

// Update EUROMILLIONS
content = content.replace(
    'bg: "bg-gradient-to-br from-blue-50/30 via-slate-50 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-euro-950/10"',
    'bg: "bg-gradient-to-br from-blue-50/30 via-slate-50 to-indigo-50/20 dark:from-black dark:via-black dark:to-black"'
);
content = content.replace(
    'card: "glass-card",\n        themeColor: "euro"',
    'card: "glass-card dark:bg-euro-950/30 dark:border-euro-900/50",\n        themeColor: "euro"'
);

// Update TOTOLOTO
content = content.replace(
    'bg: "bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-toto-950/10"',
    'bg: "bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 dark:from-black dark:via-black dark:to-black"'
);
content = content.replace(
    'card: "glass-card",\n        themeColor: "toto"',
    'card: "glass-card dark:bg-toto-950/30 dark:border-toto-900/50",\n        themeColor: "toto"'
);

// Update EURODREAMS
content = content.replace(
    'bg: "bg-gradient-to-br from-purple-50/30 via-slate-50 to-pink-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-dream-950/10"',
    'bg: "bg-gradient-to-br from-purple-50/30 via-slate-50 to-pink-50/20 dark:from-black dark:via-black dark:to-black"'
);
content = content.replace(
    'card: "glass-card",\n        themeColor: "dream"',
    'card: "glass-card dark:bg-dream-950/30 dark:border-dream-900/50",\n        themeColor: "dream"'
);

// Update low hits styling
content = content.replace(
    "'bg-transparent text-zinc-800 dark:text-zinc-300 border border-zinc-800 dark:border-zinc-300'",
    "'bg-transparent text-black dark:text-white border border-black dark:border-white'"
);
// In case the previous replace didn't work and it's still the old one:
content = content.replace(
    "'bg-surface-2 text-white border border-border/50'",
    "'bg-transparent text-black dark:text-white border border-black dark:border-white'"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done mapping themes');