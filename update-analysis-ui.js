const fs = require('fs');
const glob = require('fs').readdirSync;

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace main backgrounds
    content = content.replace(/bg-zinc-50 dark:bg-black/g, 'bg-surface-1 text-foreground transition-all duration-500');
    content = content.replace(/bg-zinc-100 dark:bg-zinc-900/g, 'bg-surface-2 text-foreground');
    content = content.replace(/bg-white dark:bg-zinc-900/g, 'bg-surface-1/60 border border-border backdrop-blur-md');
    content = content.replace(/bg-white dark:bg-zinc-950/g, 'bg-surface-1/60 border border-border backdrop-blur-md');
    content = content.replace(/border-zinc-200 dark:border-zinc-800/g, 'border-border');
    content = content.replace(/text-zinc-500 dark:text-zinc-400/g, 'text-muted-foreground');
    content = content.replace(/text-zinc-900 dark:text-zinc-100/g, 'text-foreground');
    content = content.replace(/bg-zinc-800 text-white hover:bg-zinc-700/g, 'bg-accent/10 dark:bg-accent/20 text-accent font-bold border border-accent/50 hover:bg-accent/30');

    // Make sure we have a nice wrapper for the page
    // Look for <div className={`min-h-screen bg-zinc-50...
    content = content.replace(/min-h-screen bg-zinc-50/g, 'min-h-screen bg-surface-1');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated UI in:', filePath);
}

replaceInFile('src/components/AnalysisClient.tsx');
replaceInFile('src/app/analysis/page.tsx');
replaceInFile('src/app/statistics/page.tsx');
replaceInFile('src/app/history/page.tsx');
replaceInFile('src/app/ranking/page.tsx');

// Find all other files in analysis and apply the same
function findAndReplace(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = dir + '/' + file.name;
        if (file.isDirectory()) {
            findAndReplace(fullPath);
        } else if (file.name.endsWith('.tsx')) {
            replaceInFile(fullPath);
        }
    }
}

findAndReplace('src/app/analysis');
findAndReplace('src/app/statistics');

