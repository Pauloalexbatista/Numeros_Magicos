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
        
        // 1. Replace the row wrapper class
        // In TopNumber, TopStar, Historical, StarJackpot:
        // className="flex items-center justify-between rounded-lg border border-border/50 bg-transparent px-3 py-2 transition-colors hover:bg-surface-2"
        content = content.replace(
            /className="flex items-center justify-between rounded-lg border border-[^"]+"/g,
            'className="flex items-center justify-between rounded-full border-2 border-white/80 bg-transparent px-3 py-2 transition-colors hover:border-white"'
        );

        // In LastDrawNumberSystems:
        // className="flex items-center justify-between rounded-lg border border-border/50 bg-transparent px-3 py-2 transition-colors"
        // Also might have hover:bg-surface-2
        
        // In LastDrawStarSystems:
        // className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-1\/60 border border-accent-border hover:scale-[1.01] transition-all"
        content = content.replace(
            /className="flex items-center justify-between px-3 py-2 rounded-lg bg-[^"]+"/g,
            'className="flex items-center justify-between rounded-full border-2 border-white/80 bg-transparent px-3 py-2 transition-all hover:border-white"'
        );
        
        // Ensure all badges are uniform bg-accent text-white
        content = content.replace(/index === 0 \? "[^"]+" : index < 3 \? "[^"]+" : "[^"]+"/g, '"bg-accent text-white shadow-sm"');
        content = content.replace(/index === 0 \? '[^']+' : index < 3 \? '[^']+' : '[^']+'/g, "'bg-accent text-white shadow-sm'");
        
        // In LastDrawNumberSystems, the badge is based on result.hits:
        // result.hits === maxNumbers ? 'bg-accent text-white' : result.hits === (maxNumbers - 1) ? "bg-accent/20 text-accent" : 'bg-surface-2 text-muted-foreground'
        content = content.replace(/result\.hits === maxNumbers \? '[^']+' :[^:]+:[^}]+/g, "'bg-accent text-white shadow-sm'");
        content = content.replace(/result\.hits === maxStars \? "[^"]+" :[^:]+:[^}]+/g, '"bg-accent text-white shadow-sm"');
        
        // Make text colors consistent: text-foreground -> text-white
        content = content.replace(/text-foreground/g, 'text-white');
        
        // Fix header: text-[var(--accent)] -> text-white
        content = content.replace(/text-\[var\(--accent\)\]/g, 'text-white');
        
        // Update header background or anything if needed? No.
        
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log("Applied uniform white pill styling to all dashboard widgets.");
