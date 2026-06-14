const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/[game]/page.tsx', 'utf8');

// Replace "?import" or "???import" or anything like that
code = code.replace(/\?+import/g, 'import');
code = code.replace(/\uFFFD/g, ''); // remove replacement characters

fs.writeFileSync('src/app/dashboard/[game]/page.tsx', code, 'utf8');
console.log("Fixed dashboard page.");
