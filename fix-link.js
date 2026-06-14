const fs = require('fs');
let code = fs.readFileSync('src/app/ranking/[game]/page.tsx', 'utf8');

code = code.replace(/href=\{`\/dashboard\/\$\{game\}\/\$\{encodeURIComponent\(sys\.systemName\)\}`\}/g, "href={`/ranking/${game}/${encodeURIComponent(sys.systemName)}`}");

fs.writeFileSync('src/app/ranking/[game]/page.tsx', code, 'utf8');
console.log("Fixed link href.");
