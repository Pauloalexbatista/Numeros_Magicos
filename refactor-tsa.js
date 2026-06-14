const fs = require('fs');
const tsaFile = 'src/components/TopSystemsAnalysis.tsx';
let content = fs.readFileSync(tsaFile, 'utf8');

// Replace the hardcoded Card classes
content = content.replace(/<Card className="p-6 bg-white border-slate-200 shadow-xl transition-all duration-700 mb-8">/g, '<Card className="p-6 glass-card mb-8">');

// Replace the title styles
content = content.replace(/<h2 className={`text-2xl font-bold flex items-center gap-2 \$\{palette\.text\}`}>/g, '<h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--accent)" }}>');

// Replace the subtext
content = content.replace(/<p className="text-slate-500 text-sm">/g, '<p className="text-muted-foreground text-sm">');

// Replace the button group container
content = content.replace(/<div className="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">/g, '<div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: "var(--surface-2)" }}>');

// Replace the buttons
content = content.replace(/className=\{`[\s\S]*?\`\}/g, `className={\`
                                px-4 py-1.5 rounded-md text-sm font-medium transition-all
                                \${selectedYear === year
                                    ? 'glass-button'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-3'}
                            \`}`);

// Replace table header
content = content.replace(/<tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">/g, '<tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">');

content = content.replace(/<th className={`py-3 px-4 text-center \$\{palette\.text\}`}>/g, '<th className="py-3 px-4 text-center" style={{ color: "var(--accent)" }}>');
content = content.replace(/<th className="py-3 px-4 text-center text-slate-400">/g, '<th className="py-3 px-4 text-center text-muted-foreground">');

// Replace table body
content = content.replace(/<tbody className="divide-y divide-slate-100">/g, '<tbody className="divide-y divide-border/30">');

// Write back
fs.writeFileSync(tsaFile, content, 'utf8');
console.log('TopSystemsAnalysis refactored');
