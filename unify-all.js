const fs = require('fs');

const filesToCleanInner = [
    'src/components/dashboard/LastDrawNumberSystems.tsx',
    'src/components/dashboard/LastDrawStarSystems.tsx',
    'src/components/dashboard/HistoricalBestWidget.tsx',
    'src/components/dashboard/StarJackpotLeaders.tsx',
    'src/components/dashboard/TopNumberSystemsWidget.tsx',
    'src/components/dashboard/TopStarSystemsWidget.tsx'
];

for (const file of filesToCleanInner) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Make the inner items have simple subtle borders and no solid background
    content = content.replace(/border border-accent-border bg-surface-1\/60/g, 'border border-border/50 bg-transparent');
    // Also remove the hover effects that add backgrounds to avoid visual clutter
    content = content.replace(/hover:bg-accent-muted/g, 'hover:bg-surface-2');
    
    // Unify all badge backgrounds to be generic accent color instead of gradients
    content = content.replace(/bg-gradient-to-br from-[a-z]+-[0-9]+ to-[a-z]+-[0-9]+ text-[a-z]+-[0-9]+ shadow-[a-z]+-[0-9]+\/[0-9]+/g, 'bg-accent text-white shadow-sm');
    
    fs.writeFileSync(file, content, 'utf8');
}

// Fix LatestDrawWidget
const ldwFile = 'src/components/dashboard/LatestDrawWidget.tsx';
if (fs.existsSync(ldwFile)) {
    let ldwContent = fs.readFileSync(ldwFile, 'utf8');
    ldwContent = ldwContent.replace(
        '<section className="rounded-2xl border border-border bg-surface-1/60 shadow-sm">',
        '<section className="glass-card">'
    );
    fs.writeFileSync(ldwFile, ldwContent, 'utf8');
}

// Fix LastDrawStarSystems exact header mismatch
const ldssFile = 'src/components/dashboard/LastDrawStarSystems.tsx';
if (fs.existsSync(ldssFile)) {
    let ldssContent = fs.readFileSync(ldssFile, 'utf8');
    
    const targetHeader = `<h3 className="font-bold text-lg text-accent flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-accent" />
                        Melhores Sistemas de {starLabel} em{' '}
                        <span className="text-sm font-semibold opacity-90 underline decoration-dotted cursor-help" title="Data do ultimo sorteio analisado">
                            ({lastDrawDate})
                        </span>
                    </h3>`;
    
    const simpleHeader = `<span className="font-semibold text-sm">Melhores Sistemas de {starLabel} - ({lastDrawDate})</span>`;
    
    ldssContent = ldssContent.replace(targetHeader, simpleHeader);
    
    // Also fix the Trophy icon being imported but unused if we remove it
    
    fs.writeFileSync(ldssFile, ldssContent, 'utf8');
}

console.log('Unification script applied!');
