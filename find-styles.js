const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find all `className` attributes that contain `bg-` or `from-` to see what light styles exist.
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('bg-') || lines[i].includes('from-') || lines[i].includes('text-slate') || lines[i].includes('bg-slate') || lines[i].includes('divide-slate')) {
        console.log(`${i+1}: ${lines[i].trim()}`);
    }
}
