const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace hit balls class string
content = content.replace(
  /className=\{`\n\s+w-6 h-6 flex items-center justify-center rounded-full text-\[10px\] font-bold\n\s+\$\{isHit \? '\$\{currentTheme\.accentBg\} text-white shadow-\[0_0_10px_var\(--glow\)\] border border-white\/20' : 'bg-card\/50 backdrop-blur-sm border border-border text-muted-foreground'\}\n\s+`\}/g,
  "className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${isHit ? 'text-white border border-white/20 shadow-md' : 'bg-card/50 backdrop-blur-sm border border-border text-muted-foreground'}`} style={isHit ? { backgroundColor: gameConfig.ui.accent, boxShadow: `0 0 12px color-mix(in srgb, ${gameConfig.ui.accent} 60%, transparent)` } : {}}"
);

// Replace actual balls
content = content.replace(
  /<span key=\{n\} className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-2 text-foreground text-xs font-bold shadow-sm">/g,
  '<span key={n} className="w-6 h-6 flex items-center justify-center rounded-full text-white text-xs font-bold shadow-sm border border-white/10" style={{ backgroundColor: gameConfig.ui.accent }}>'
);

// Replace badges (Acertos)
content = content.replace(
  /\$\{pred\.hits >= 3 \? `\$\{currentTheme\.badge\} font-bold` :/g,
  "${pred.hits >= 3 ? 'text-white font-bold border border-white/20' :"
);
// And add the style to the span of the badge!
// Wait, the badge span is:
content = content.replace(
  /<span className=\{`\n\s+inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold/g,
  "<span style={pred.hits >= 3 ? { backgroundColor: gameConfig.ui.accent, boxShadow: `0 0 12px color-mix(in srgb, ${gameConfig.ui.accent} 50%, transparent)` } : {}} className={`\n                                                      inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold"
);


fs.writeFileSync(file, content, 'utf8');
console.log('Fixed balls in page.tsx');
