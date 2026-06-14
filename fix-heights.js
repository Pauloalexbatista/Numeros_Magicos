const fs = require('fs');

const files = [
    'src/components/dashboard/LastDrawNumberSystems.tsx',
    'src/components/dashboard/LastDrawStarSystems.tsx',
    'src/components/dashboard/HistoricalBestWidget.tsx',
    'src/components/dashboard/StarJackpotLeaders.tsx',
    'src/components/dashboard/TopNumberSystemsWidget.tsx',
    'src/components/dashboard/TopStarSystemsWidget.tsx'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Force the outer glass-card to have a fixed height
    content = content.replace(/className="glass-card flex flex-col p-4 gap-4"/g, 'className="glass-card flex flex-col p-4 gap-4 h-[420px]"');
    
    // 2. Make the inner list container scrollable
    // Some have <div className="flex-1">
    content = content.replace(/className="flex-1"/g, 'className="flex-1 overflow-y-auto custom-scrollbar pr-1"');
    
    // LastDrawStarSystems might have <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
    content = content.replace(/<div className="p-2 max-h-\[300px\] overflow-y-auto custom-scrollbar">/g, '<div className="flex-1 overflow-y-auto custom-scrollbar pr-1">');

    fs.writeFileSync(file, content, 'utf8');
}
console.log("Applied fixed height h-[420px] and overflow scrolling to all cards");
