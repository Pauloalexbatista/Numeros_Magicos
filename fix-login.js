const fs = require('fs');
const file = 'src/app/login/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /accent: 'var\(--euro-accent\)', border: 'var\(--euro-border\)', glow: 'var\(--euro-glow\)' \}/g,
  "accent: 'var(--euro-accent)', border: 'var(--euro-border)', glow: 'var(--euro-glow)', bg: 'var(--euro-bg)' }"
);
content = content.replace(
  /accent: 'var\(--toto-accent\)', border: 'var\(--toto-border\)', glow: 'var\(--toto-glow\)' \}/g,
  "accent: 'var(--toto-accent)', border: 'var(--toto-border)', glow: 'var(--toto-glow)', bg: 'var(--toto-bg)' }"
);
content = content.replace(
  /accent: 'var\(--dream-accent\)', border: 'var\(--dream-border\)', glow: 'var\(--dream-glow\)' \}/g,
  "accent: 'var(--dream-accent)', border: 'var(--dream-border)', glow: 'var(--dream-glow)', bg: 'var(--dream-bg)' }"
);
content = content.replace(
  /accent: 'var\(--mega-accent\)', border: 'rgba\\(245, 158, 11, 0\.3\\)', glow: 'rgba\\(245, 158, 11, 0\.15\\)' \}/g,
  "accent: 'var(--mega-accent)', border: 'rgba(245, 158, 11, 0.3)', glow: 'rgba(245, 158, 11, 0.15)', bg: 'var(--mega-bg)' }"
);
content = content.replace(
  /<div className=\{`min-h-screen text-foreground font-dm-sans relative overflow-hidden flex flex-col game-page-\$\{gameConfig\.slug\}`\} data-game=\{gameConfig\.enum\}>/g,
  '<div className={`min-h-screen text-foreground font-dm-sans relative overflow-hidden flex flex-col game-page-${gameConfig.slug}`} data-game={gameConfig.enum} style={{ backgroundColor: gameConfig.bg }}>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed login page');
