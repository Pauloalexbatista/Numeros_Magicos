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
        
        // Restore text color using the CSS variable defined in globals.css
        content = content.replace(/text-sm font-medium text-zinc-800 dark:text-zinc-100/g, 'text-sm font-medium text-[var(--text-primary)]');
        content = content.replace(/text-xs font-bold text-zinc-800 dark:text-zinc-100/g, 'text-xs font-bold text-[var(--text-primary)]');
        
        // Restore border color using the CSS variable defined in globals.css
        content = content.replace(/border-2 border-black\/10 dark:border-white\/20/g, 'border-2 border-[var(--border-strong)]');
        
        // Restore hover border using CSS variable
        content = content.replace(/hover:border-black\/30 dark:hover:border-white\/50/g, 'hover:border-[var(--text-primary)]');
        
        // Restore header text
        content = content.replace(/border-border pb-3 text-zinc-800 dark:text-zinc-100/g, 'border-b border-[var(--border-default)] pb-3 text-[var(--text-primary)]');
        content = content.replace(/border-b border-\[var\(--border-default\)\]/g, 'border-b border-[var(--border-default)]'); // prevent double
        
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log("Restored CSS variables.");
