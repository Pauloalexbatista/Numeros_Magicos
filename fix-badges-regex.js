const fs = require('fs');

const rankingFiles = [
    'src/components/dashboard/HistoricalBestWidget.tsx',
    'src/components/dashboard/StarJackpotLeaders.tsx',
    'src/components/dashboard/TopNumberSystemsWidget.tsx',
    'src/components/dashboard/TopStarSystemsWidget.tsx'
];

for (const file of rankingFiles) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // This matches: className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold bg-accent text-white" (or any other background classes)
    // We want to replace whatever background/text color classes are there with our dynamic expression.
    
    // For TopNumberSystemsWidget and TopStarSystemsWidget:
    // <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold bg-accent text-white">
    // or shadow-sm ...
    content = content.replace(
        /<span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-\[11px\] font-bold[^>]*>/g,
        '<span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${index === 0 ? "bg-accent text-white" : index < 3 ? "bg-accent/20 text-accent" : "bg-surface-2 text-muted-foreground"}`}>'
    );
    
    // For HistoricalBestWidget and StarJackpotLeaders:
    // <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm bg-accent text-white shadow-sm`}>
    // or similar
    content = content.replace(
        /<div className=\{`flex h-7 w-7 items-center justify-center rounded-full text-\[11px\] font-bold shadow-sm[^>]*`\}>/g,
        '<div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${index === 0 ? "bg-accent text-white" : index < 3 ? "bg-accent/20 text-accent" : "bg-surface-2 text-muted-foreground"}`}>'
    );

    fs.writeFileSync(file, content, 'utf8');
}
console.log("Updated ranking widgets");
