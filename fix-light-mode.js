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
        
        // Fix text color in the span that renders the system name
        // It was `<span className="truncate text-sm font-medium text-white">`
        content = content.replace(/text-sm font-medium text-white/g, 'text-sm font-medium text-foreground');
        content = content.replace(/text-xs font-bold text-white/g, 'text-xs font-bold text-foreground');
        
        // Fix border color: border-white/80 -> border-border
        content = content.replace(/border-white\/80/g, 'border-border');
        content = content.replace(/hover:border-white/g, 'hover:border-foreground/50');
        
        // Fix header text color. It was `<div className="... border-border pb-3 text-white">`
        // Should be text-[var(--accent)] or text-foreground
        // Let's use text-foreground or text-[var(--accent)]
        // The user originally had text-[var(--accent)] or text-foreground there.
        content = content.replace(/border-border pb-3 text-white/g, 'border-border pb-3 text-foreground');
        
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log("Fixed light mode visibility issues.");
