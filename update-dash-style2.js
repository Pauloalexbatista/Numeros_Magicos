const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/[game]/page.tsx', 'utf8');

const searchStr = '<div className="min-h-screen bg-surface-1 text-foreground p-4 sm:p-6 font-sans transition-all duration-500">';
const replaceStr = '<div className="min-h-screen bg-surface-1 text-foreground p-4 sm:p-6 font-sans transition-all duration-500" style={{\n            "--accent": gameConfig?.ui.accent,\n            "--accent-hover": "color-mix(in srgb, " + gameConfig?.ui.accent + " 80%, white)",\n            "--accent-muted": "color-mix(in srgb, " + gameConfig?.ui.accent + " 15%, transparent)",\n            "--accent-border": "color-mix(in srgb, " + gameConfig?.ui.accent + " 30%, transparent)",\n        } as React.CSSProperties}>';

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/app/dashboard/[game]/page.tsx', code, 'utf8');
  console.log('Updated dashboard page styles');
} else {
  console.log('Could not find the target div to replace.');
}