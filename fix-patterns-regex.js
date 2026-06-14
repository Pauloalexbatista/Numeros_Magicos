const fs = require('fs');
const file = 'src/app/patterns/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const getHeatColor = \(value: number, max: number\) => \{/g, "const getHeatColor = (value: number, max: number, reverse: boolean = false) => {");
content = content.replace(/const ratio = Math\.min\(1, Math\.max\(0, value \/ max\)\);/g, "let ratio = Math.min(1, Math.max(0, value / max));\n        if (reverse) ratio = 1 - ratio;");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed patterns via regex.');
