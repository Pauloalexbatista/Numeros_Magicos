const fs = require('fs');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;

    // Check if we need to modify
    if (content.match(/bg-zinc-50|bg-zinc-100|bg-white dark:bg-zinc-|border-zinc-200/)) {
        content = content.replace(/bg-zinc-50 dark:bg-black/g, 'bg-surface-1 text-foreground transition-all duration-500');
        content = content.replace(/min-h-screen bg-zinc-50/g, 'min-h-screen bg-surface-1 transition-all duration-500');
        content = content.replace(/bg-zinc-100 dark:bg-zinc-900/g, 'bg-surface-2 text-foreground');
        content = content.replace(/bg-zinc-100 dark:bg-zinc-800/g, 'bg-surface-2 text-foreground');
        content = content.replace(/bg-white dark:bg-zinc-900/g, 'bg-surface-1/60 border border-border backdrop-blur-md');
        content = content.replace(/bg-white dark:bg-zinc-950/g, 'bg-surface-1/60 border border-border backdrop-blur-md');
        content = content.replace(/border-zinc-200 dark:border-zinc-800/g, 'border-border');
        content = content.replace(/border-zinc-200 dark:border-zinc-700/g, 'border-border');
        content = content.replace(/text-zinc-500 dark:text-zinc-400/g, 'text-muted-foreground');
        content = content.replace(/text-zinc-900 dark:text-zinc-100/g, 'text-foreground');
        content = content.replace(/bg-zinc-800 text-white hover:bg-zinc-700/g, 'bg-accent/10 dark:bg-accent/20 text-accent font-bold border border-accent/50 hover:bg-accent/30');
        content = content.replace(/bg-blue-600 text-white hover:bg-blue-700/g, 'bg-accent text-white shadow-[0_0_15px_var(--accent-muted)] hover:brightness-110');
        content = content.replace(/bg-blue-50 text-blue-700 dark:bg-blue-900\/20 dark:text-blue-400/g, 'bg-accent/10 text-accent font-bold');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated UI in:', filePath);
    }
}

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

findAndReplace('src/app');
findAndReplace('src/components');

