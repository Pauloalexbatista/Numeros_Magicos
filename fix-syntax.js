const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const searchStr = 'bg-card/50 backdrop-blur-sm text-foreground" style={{ borderColor: gameConfig.ui.accent, boxShadow: `inset 0 0 10px color-mix(in srgb, ${gameConfig.ui.accent} 20%, transparent)` }} className="';

const replaceStr = 'bg-card/50 backdrop-blur-sm text-foreground';

if (content.includes(searchStr)) {
  content = content.replace(searchStr, replaceStr);
  
  // Now we need to add the style attribute properly to that div.
  // We'll replace the closing backtick and angle bracket of that className.
  const badTagEnd = 'hover:scale-105 transition-transform cursor-default\n                                    `}>';
  const goodTagEnd = 'hover:scale-105 transition-transform cursor-default\n                                    `} style={{ borderColor: gameConfig.ui.accent, boxShadow: `inset 0 0 10px color-mix(in srgb, ${gameConfig.ui.accent} 20%, transparent)` }}>';
  
  content = content.replace(badTagEnd, goodTagEnd);
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed syntax error!');
} else {
  console.log('String not found.');
}

