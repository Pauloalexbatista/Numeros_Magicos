const fs = require('fs');
const file = 'src/components/SendToWheelingButton.tsx';
let content = fs.readFileSync(file, 'utf8');

// The original file has an emoji right before {label...
// It looks like `>\n            YZY? {label` or similar
content = content.replace(/>\s*[\s\S]*?\{label \|\| "Enviar para Desdobramentos"\}\s*<\/button>/, '> {label || "Enviar para Desdobramentos"}</button>');

fs.writeFileSync(file, content, 'utf8');
console.log('Removed emoji from SendToWheelingButton');
