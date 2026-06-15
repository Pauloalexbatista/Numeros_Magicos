const fs = require('fs');
const path = require('path');

const file = 'src/app/ranking/[game]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add background color to the main page wrapper inline style
content = content.replace(
  /"--glow": "color-mix\(in srgb, " \+ gameConfig\?.ui\.accent \+ " 20%, transparent\)",/g,
  `"--glow": "color-mix(in srgb, " + gameConfig?.ui.accent + " 20%, transparent)",
            backgroundColor: "var(--" + (gameConfig?.slug === 'euromillions' ? 'euro' : gameConfig?.slug === 'totoloto' ? 'toto' : gameConfig?.slug === 'eurodreams' ? 'dream' : 'mega') + "-bg)",`
);

// 2. Replace the main Card with glass-card
content = content.replace(
  /<Card className="space-y-4 rounded-2xl border border-border bg-surface-1\/60 p-6 shadow-sm backdrop-blur-md">/g,
  '<Card className="space-y-4 glass-card p-6">'
);

// 3. Replace the leader items with glass-card
content = content.replace(
  /className="flex items-center justify-between rounded-xl border border-border bg-surface-2\/60 p-3"/g,
  'className="flex items-center justify-between glass-card p-3"'
);

// 4. Replace the Link wrapper with glass-card
content = content.replace(
  /<div className="flex w-fit items-center gap-2 rounded-xl border border-border bg-surface-1\/60 p-1\.5 shadow-sm backdrop-blur-md">/g,
  '<div className="flex w-fit items-center gap-2 glass-card p-1.5">'
);

// 5. Replace the ranking items Card with glass-card
content = content.replace(
  /<Card className="rounded-2xl border border-border bg-surface-1\/60 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md">/g,
  '<Card className="glass-card p-6 transition-all duration-300 hover:shadow-md hover:border-[var(--accent-border)] hover:bg-[var(--accent-muted)]">'
);

fs.writeFileSync(file, content);
console.log('Fixed ranking page');
