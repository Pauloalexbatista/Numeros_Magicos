const fs = require('fs');

// Rule for Rankings: 
// index === 0 -> bg-accent text-white
// index === 1 || index === 2 -> bg-accent/20 text-accent
// default -> bg-surface-2 text-muted-foreground

const rankingFiles = [
    'src/components/dashboard/HistoricalBestWidget.tsx',
    'src/components/dashboard/StarJackpotLeaders.tsx',
    'src/components/dashboard/TopNumberSystemsWidget.tsx',
    'src/components/dashboard/TopStarSystemsWidget.tsx'
];

for (const file of rankingFiles) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // In TopNumberSystemsWidget and TopStarSystemsWidget, the badge is:
    // <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold bg-accent text-white shadow-sm">
    content = content.replace(
        /<span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-\[11px\] font-bold bg-accent text-white shadow-sm">/g,
        '<span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${index === 0 ? "bg-accent text-white" : index < 3 ? "bg-accent/20 text-accent" : "bg-surface-2 text-muted-foreground"}`}>'
    );
    
    // In HistoricalBestWidget and StarJackpotLeaders, the badge is:
    // <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm bg-accent text-white shadow-sm`}>
    content = content.replace(
        /<div className=\{`flex h-7 w-7 items-center justify-center rounded-full text-\[11px\] font-bold shadow-sm bg-accent text-white shadow-sm`\}>/g,
        '<div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${index === 0 ? "bg-accent text-white" : index < 3 ? "bg-accent/20 text-accent" : "bg-surface-2 text-muted-foreground"}`}>'
    );

    fs.writeFileSync(file, content, 'utf8');
}

// Rule for Last Draw Hits:
// We already have a rule in LastDrawNumberSystems:
// result.hits === maxNumbers ? 'bg-accent text-white' : result.hits === (maxNumbers - 1) ? 'bg-accent-muted text-accent' : 'bg-surface-2 text-muted-foreground'
// Let's ensure it uses bg-accent/20 instead of bg-accent-muted so it matches the ranking visually
const ldnsFile = 'src/components/dashboard/LastDrawNumberSystems.tsx';
if (fs.existsSync(ldnsFile)) {
    let content = fs.readFileSync(ldnsFile, 'utf8');
    content = content.replace(/'bg-accent-muted text-accent'/g, '"bg-accent/20 text-accent"');
    fs.writeFileSync(ldnsFile, content, 'utf8');
}

const ldssFile = 'src/components/dashboard/LastDrawStarSystems.tsx';
if (fs.existsSync(ldssFile)) {
    let content = fs.readFileSync(ldssFile, 'utf8');
    // Currently it has: result.hits === maxStars ? 'bg-accent text-white' : 'bg-surface-2 text-accent'
    // Let's change it to: result.hits === maxStars ? 'bg-accent text-white' : result.hits === (maxStars - 1) ? 'bg-accent/20 text-accent' : 'bg-surface-2 text-muted-foreground'
    content = content.replace(
        /result\.hits === maxStars\s*\?\s*'bg-accent text-white'\s*:\s*'bg-surface-2 text-accent'/g,
        'result.hits === maxStars ? "bg-accent text-white" : result.hits === (maxStars - 1) ? "bg-accent/20 text-accent" : "bg-surface-2 text-muted-foreground"'
    );
    fs.writeFileSync(ldssFile, content, 'utf8');
}

console.log("Applied universal visual hierarchy to all badges");
