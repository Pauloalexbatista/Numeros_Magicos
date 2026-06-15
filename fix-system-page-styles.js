const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Prediction main card
content = content.replace(
  /bg-gradient-to-br \$\{currentTheme\.gradient_light\}/g,
  'glass-card'
);

// Table header
content = content.replace(
  /bg-slate-50 dark:bg-zinc-950 text-slate-400 dark:text-zinc-500/g,
  'bg-surface-1/50 text-muted-foreground'
);

// Table rows and divides
content = content.replace(
  /divide-slate-100 dark:divide-zinc-800/g,
  'divide-border'
);
content = content.replace(
  /hover:bg-slate-50\/50 dark:hover:bg-zinc-950\/30/g,
  'hover:bg-surface-2/30'
);
content = content.replace(
  /text-slate-650 dark:text-zinc-300/g,
  'text-foreground'
);
content = content.replace(
  /bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300/g,
  'bg-surface-2 text-foreground'
);

// Hit status badges
content = content.replace(
  /border-slate-250 dark:border-zinc-800 text-slate-400 dark:text-zinc-500/g,
  'border-border text-muted-foreground'
);
content = content.replace(
  /bg-green-100 dark:bg-green-950\/20 text-green-700 dark:text-green-400 border border-green-200\/50/g,
  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
);
content = content.replace(
  /bg-yellow-50 dark:bg-yellow-950\/20 text-yellow-750 dark:text-yellow-400 border border-yellow-100\/50/g,
  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
);
content = content.replace(
  /bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500/g,
  'bg-surface-2 text-muted-foreground border border-border/50'
);

// Fix other text colors
content = content.replace(
  /text-slate-500 dark:text-zinc-400/g,
  'text-muted-foreground'
);
content = content.replace(
  /text-slate-400 dark:text-zinc-500/g,
  'text-muted-foreground/70'
);
content = content.replace(
  /text-slate-650 dark:text-zinc-350/g,
  'text-foreground/90'
);

// Also remove `dark:bg-zinc-950` from gameThemeMap if it exists (not strictly necessary but cleans up)
// but it's fine.

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed page.tsx table and prediction styles');
