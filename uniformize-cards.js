const fs = require('fs');
const glob = require('fs').readdirSync; // not needed, we know the files
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

    // Replace <div className="game-card" ...> with <div className="glass-card flex flex-col p-4 gap-4" ...>
    content = content.replace(/className="game-card"/g, 'className="glass-card flex flex-col p-4 gap-4"');
    
    // For LastDrawStarSystems which had a unique style:
    content = content.replace(/className="rounded-xl border-2 border-accent-border overflow-hidden relative shadow-sm"[^>]*>/g, 'className="glass-card flex flex-col p-4 gap-4">');
    
    // Replace <div className="game-card-header"> with standard flex header
    content = content.replace(/className="game-card-header"/g, 'className="flex items-center justify-between border-b border-border pb-3 text-[var(--accent)]"');
    
    // For LastDrawStarSystems header:
    content = content.replace(/className="p-4 border-b border-accent-border flex justify-between items-center bg-surface-1\/30 backdrop-blur-sm"/g, 'className="flex items-center justify-between border-b border-border pb-3 text-[var(--accent)]"');

    // Replace game-card-body just with nothing special or flex-1
    content = content.replace(/className="game-card-body"/g, 'className="flex-1"');

    // Remove the dot span completely from old game-card-headers
    content = content.replace(/<span className="dot" \/>\s*/g, '');

    fs.writeFileSync(file, content, 'utf8');
}

console.log('Uniformized all dashboard cards!');
