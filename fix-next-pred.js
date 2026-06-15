const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /bg-card\/50 backdrop-blur-sm text-foreground border-border/g,
  "bg-card/50 backdrop-blur-sm text-foreground\" style={{ borderColor: gameConfig.ui.accent, boxShadow: `inset 0 0 10px color-mix(in srgb, ${gameConfig.ui.accent} 20%, transparent)` }} className=\" "
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed next prediction balls border');
