const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

let utilities = `
\nhover\\:bg-accent:hover { background-color: var(--accent) !important; }
\nhover\\:text-accent:hover { color: var(--accent) !important; }
\nhover\\:bg-accent-muted:hover { background-color: var(--accent-muted) !important; }
`ps=

css = css + utilities;
fs.writeFileSync('src/app/globals.css', css, 'utf8');
console.log('Hover utility classes added');