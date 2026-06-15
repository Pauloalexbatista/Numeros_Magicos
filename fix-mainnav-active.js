const fs = require('fs');
const file = 'src/components/MainNavigation.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace active logic
content = content.replace(
  /const isActive = \(href: string\) => pathname === href \|\| pathname\?\.startsWith\(href\);/g,
  "const isActive = (gameId: string, href: string) => pathname === href || pathname?.startsWith(href) || pathname?.includes(`/${gameId}`);"
);

// We need to replace the usage of isActive for games
content = content.replace(
  /const active = isActive\(game\.href\);/g,
  "const active = isActive(game.id, game.href);"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed MainNavigation active state');
