const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

let utilities = `
.bg-accent { background-color: var(--accent) !important; }
.text-accent { color: var(--accent) !important; }
.border-accent-border { border-color: var(--accent-border) !important; }
.ring-accent { --tw-ring-color: var(--accent) !important; }
 .text-white { color: #fff !important; }
`;

css = css + '\n' + utilities;
fs.writeFileSync('src/app/globals.css', css, 'utf8');
console.log('Explicit utility classes added');