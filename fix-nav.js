const fs = require('fs');
const file = 'src/components/MainNavigation.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix home link to prevent navigation if isLogin
content = content.replace('<Link href="/games" className="flex items-center gap-2 shrink-0"', '<Link href="/games" onClick={(e) => { if (isLogin) e.preventDefault(); }} className="flex items-center gap-2 shrink-0"');

// Fix game translation
content = content.replace('<span className="hidden sm:inline-block">{game.name}</span>', '<span className="hidden sm:inline-block">{t(game.id as any)}</span>');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed MainNavigation');
