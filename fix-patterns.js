const fs = require('fs');

const file = 'src/app/patterns/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/getColorScale/g, 'getHeatColor');
content = content.replace(/\$\{getTextColor\([^}]+\)\}/g, 'text-muted-foreground');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed patterns page.');
