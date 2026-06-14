const fs = require('fs');
const file = 'src/components/TopSystemsAnalysis.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<th className=\{\`\s*px-4 py-1\.5 rounded-md text-sm font-medium transition-all\s*\$\{selectedYear === year[\s\S]*?\}\s*\`\}>\{jackpotLabel\}<\/th>/g, '<th className="py-3 px-4 text-center" style={{ color: "var(--accent)" }}>{jackpotLabel}</th>');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed TopSystemsAnalysis');
