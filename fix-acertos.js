const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        pred.hits === maxNumbers 
            ? 'text-white border-0' 
            : pred.hits === maxNumbers - 1 
                ? 'border bg-transparent shadow-sm' 
                : 'bg-surface-2 text-white border border-border/50'`;

const replacementStr = `        pred.hits === maxNumbers 
            ? 'text-white border-0' 
            : pred.hits === maxNumbers - 1 
                ? 'border bg-transparent shadow-sm' 
                : 'bg-transparent text-zinc-800 dark:text-zinc-300 border border-zinc-800 dark:border-zinc-300'`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Acertos style');