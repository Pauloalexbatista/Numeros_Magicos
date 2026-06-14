const fs = require('fs');

// Fix MainNavigation.tsx
const navFile = 'src/components/MainNavigation.tsx';
let navContent = fs.readFileSync(navFile, 'utf8');

navContent = navContent.replace("if (pathname === '/login') return null;", "const isLogin = pathname === '/login';");

navContent = navContent.replace(/<Link\s+key={game\.id}\s+href={game\.href}/g, "<Link\n                key={game.id}\n                href={game.href}\n                onClick={(e) => { if (isLogin) e.preventDefault(); }}");

navContent = navContent.replace(/<Link\s+href="\/tools"/g, "<Link\n            href=\"/tools\"\n            onClick={(e) => { if (isLogin) e.preventDefault(); }}");

navContent = navContent.replace(/<Link\s+href="\/how-it-works"/g, "<Link\n            href=\"/how-it-works\"\n            onClick={(e) => { if (isLogin) e.preventDefault(); }}");

fs.writeFileSync(navFile, navContent, 'utf8');
console.log('Fixed MainNavigation');

// Fix login/page.tsx
const loginFile = 'src/app/login/page.tsx';
let loginContent = fs.readFileSync(loginFile, 'utf8');

loginContent = loginContent.replace("const gameLabel = { euro: 'Euromilhões', toto: 'Totoloto', dream: 'EuroDreams' }[game];", "const gameLabel = { euro: 'Euromilhões', toto: 'Totoloto', dream: 'EuroDreams', mega: 'Mega-Sena' }[game];");

loginContent = loginContent.replace("['euro', 'Euromilhões'],\n                ['toto', 'Totoloto'],\n                ['dream', 'EuroDreams'],", "['euro', 'Euromilhões'],\n                ['toto', 'Totoloto'],\n                ['dream', 'EuroDreams'],\n                ['mega', 'Mega-Sena'],");

fs.writeFileSync(loginFile, loginContent, 'utf8');
console.log('Fixed login/page.tsx');
