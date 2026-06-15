const fs = require('fs');
const file = 'src/components/analysis/SystemStatsViewer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Filter bar
content = content.replace(
  /className="bg-white p-1 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm"/g,
  'className="glass-card p-1 flex items-center gap-2"'
);
content = content.replace(
  /text-slate-500 ml-2/g,
  'text-muted-foreground ml-2'
);
content = content.replace(
  /text-slate-700/g,
  'text-foreground'
);
content = content.replace(
  /className="text-black"/g,
  'className="bg-background text-foreground"'
);

// Stats Cards
content = content.replace(
  /className="p-6 bg-white border-slate-200 shadow-sm"/g,
  'className="p-6 glass-card"'
);
content = content.replace(
  /text-slate-500/g,
  'text-muted-foreground'
);
content = content.replace(
  /text-slate-800/g,
  'text-foreground'
);
content = content.replace(
  /text-slate-400/g,
  'text-muted-foreground'
);

// Chart Card
content = content.replace(
  /<Card className=\{`bg-white border-slate-200 backdrop-blur-sm overflow-hidden transition-opacity duration-200 shadow-sm/g,
  '<Card className={`glass-card overflow-hidden transition-opacity duration-200'
);
content = content.replace(
  /border-slate-200/g,
  'border-border'
);
content = content.replace(
  /bg-slate-50/g,
  'bg-surface-1/50'
);
content = content.replace(
  /divide-slate-100/g,
  'divide-border'
);
content = content.replace(
  /hover:bg-slate-50/g,
  'hover:bg-surface-2/30'
);
content = content.replace(
  /text-slate-900/g,
  'text-foreground'
);
content = content.replace(
  /text-slate-600/g,
  'text-foreground/80'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed SystemStatsViewer.tsx');
