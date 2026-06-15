const fs = require('fs');

const files = [
    'src/components/dashboard/TopNumberSystemsWidget.tsx',
    'src/components/dashboard/TopStarSystemsWidget.tsx',
    'src/components/dashboard/HistoricalBestWidget.tsx',
    'src/components/dashboard/StarJackpotLeaders.tsx',
    'src/components/dashboard/LastDrawNumberSystems.tsx',
    'src/components/dashboard/LastDrawStarSystems.tsx'
];

files.forEach(file => {
    if(fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Fix text color
        content = content.replace(/text-sm font-medium text-foreground/g, 'text-sm font-medium text-zinc-800 dark:text-zinc-100');
        content = content.replace(/text-xs font-bold text-foreground/g, 'text-xs font-bold text-zinc-800 dark:text-zinc-100');
        
        // Fix border color
        content = content.replace(/border-2 border-border/g, 'border-2 border-black/10 dark:border-white/20');
        
        // Fix hover border
        content = content.replace(/hover:border-foreground\/50/g, 'hover:border-black/30 dark:hover:border-white/50');
        
        // Fix header
        content = content.replace(/border-border pb-3 text-foreground/g, 'border-border pb-3 text-zinc-800 dark:text-zinc-100');
        
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log("Applied rock-solid light/dark mode classes.");
