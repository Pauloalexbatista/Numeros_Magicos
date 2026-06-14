const fs = require('fs');

const file = 'src/app/login/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/className="text-xl font-bold" className="text-xl font-bold font-display text-foreground"/, 'className="text-xl font-bold font-display text-foreground"');
content = content.replace(/className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-surface-2 text-muted-foreground border border-border"/, 'className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-surface-2 text-muted-foreground border border-border"');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed double className in login/page.tsx');
