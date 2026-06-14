const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

let utilities = `
\\.hover\\\\:bg-accent:hover { background-color: var(--accent) !important; }
\,.hover\\\\:text-accent:hover { color: var(--accent) !important; }
\\.hover\\\\:bg-accent-muted:hover { background-color: var(--accent-muted) !important; }
`;
css = css + utilities;
fs.writeFileSync('src/app/globals.css', css, 'utf8');
console.log('Hover utility classes added');