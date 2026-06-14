const fs = require('fs');
const file = 'src/components/MainNavigation.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('        </div>\n\n        }\n        <div className="flex items-center gap-1 shrink-0">', '        </div>\n\n        <div className="flex items-center gap-1 shrink-0">');
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax error');
