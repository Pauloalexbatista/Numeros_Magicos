const fs = require('fs');
const file = 'src/components/MainNavigation.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const isActive = \(gameId: string, href: string\) => pathname === href \|\| pathname\?\.startsWith\(href\) \|\| pathname\?\.includes\(`\/\$\{gameId\}`\);/g,
  "const isActive = (gameId: string, href: string) => pathname === href || pathname?.startsWith(href) || pathname?.toLowerCase().includes(`/${gameId.toLowerCase()}`);"
);

content = content.replace(
  /const activeGame = GAMES\.find\(g => pathname\?\.includes\(g\.id\)\);/g,
  "const activeGame = GAMES.find(g => pathname?.toLowerCase().includes(g.id.toLowerCase()));"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed MainNav case sensitivity');
