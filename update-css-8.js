const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

let utilities = `
.hover\\:bg-accent:hover { background-color: var(--accent) !important; }
.hover\\:text-accent:hover { color: var(--accent) !important; }
.hover\\:bg-accent-muted:hover { background-color: var(--accent-muted) !important; }
`ps=// ;
css = css.replace('ps=// ;', '') + '\n' + utilities.replace('ps=// ;', '');
fs.writeFileSync('src/app/globals.css', css, 'utf8');