const fs = require('fs');

// Fix login/page.tsx
const loginFile = 'src/app/login/page.tsx';
let loginContent = fs.readFileSync(loginFile, 'utf8');
loginContent = loginContent.replace(/\[\'dream\',\s*\'EuroDreams\'\],?/g, "['dream', 'EuroDreams'],\n                ['mega', 'Mega-Sena'],");
fs.writeFileSync(loginFile, loginContent, 'utf8');

// Fix MainNavigation.tsx
const navFile = 'src/components/MainNavigation.tsx';
let navContent = fs.readFileSync(navFile, 'utf8');
navContent = navContent.replace('<div className="flex items-center gap-1" role="tablist" aria-label="Seleccionar jogo">', '<div className="flex items-center gap-1" role="tablist" aria-label="Seleccionar jogo">\n          {!isLogin && ');
navContent = navContent.replace('        <div className="flex items-center gap-1 shrink-0">', '        }\n        <div className="flex items-center gap-1 shrink-0">');
fs.writeFileSync(navFile, navContent, 'utf8');

// Fix middleware.ts
const mwFile = 'src/middleware.ts';
let mwContent = fs.readFileSync(mwFile, 'utf8');
mwContent = mwContent.replace('"/games", "/dashboard", "/ranking", "/analysis", "/statistics", "/history", "/simulator", "/wheeling"', '"/games", "/dashboard", "/ranking", "/analysis", "/statistics", "/history", "/simulator", "/wheeling", "/tools", "/how-it-works"');
fs.writeFileSync(mwFile, mwContent, 'utf8');

console.log('Fixed everything');
