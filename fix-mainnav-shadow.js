const fs = require('fs');
const file = 'src/components/MainNavigation.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the invalid boxShadow
content = content.replace(
  /boxShadow: active \? `0 0 15px \$\{game\.accentVar\}30, inset 0 0 10px \$\{game\.accentVar\}10` : 'none'/g,
  "boxShadow: active ? `0px 4px 24px -2px color-mix(in srgb, ${game.accentVar} 60%, transparent), inset 0 0 8px -2px color-mix(in srgb, ${game.accentVar} 40%, transparent)` : 'none'"
);

// We should also replace the background color, which might be `var(--euro-accent)15` (also invalid!)
content = content.replace(
  /backgroundColor: active \? `\$\{game\.accentVar\}15` : 'transparent'/g,
  "backgroundColor: active ? `color-mix(in srgb, ${game.accentVar} 15%, transparent)` : 'transparent'"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed invalid CSS variables with color-mix');
