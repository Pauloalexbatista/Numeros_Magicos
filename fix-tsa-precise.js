const fs = require('fs');
const file = 'src/components/TopSystemsAnalysis.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace the Card className
content = content.replace(
    '<Card className="p-6 bg-white border-slate-200 shadow-xl transition-all duration-700 mb-8">',
    '<Card className="p-6 glass-card mb-8">'
);

// 2. Replace the Title color
content = content.replace(
    '<h2 className={`text-2xl font-bold flex items-center gap-2 ${palette.text}`}>',
    '<h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--accent)" }}>'
);
content = content.replace(
    '<p className="text-slate-500 text-sm">',
    '<p className="text-muted-foreground text-sm">'
);

// 3. Replace the years container background
content = content.replace(
    '<div className="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">',
    '<div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: "var(--surface-2)" }}>'
);

// 4. Replace the year buttons
content = content.replace(
    /\${selectedYear === year[\s\S]*?\? `\$\{palette\.btn\} text-white shadow-md`[\s\S]*?: 'text-slate-500 hover:text-slate-700 hover:bg-white'\}/,
    `\${selectedYear === year
                                    ? 'glass-button'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-3'}`
);

// 5. Replace table headers
content = content.replace(
    '<tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">',
    '<tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">'
);
content = content.replace(
    '<th className={`py-3 px-4 text-center ${palette.text}`}>{jackpotLabel}</th>',
    '<th className="py-3 px-4 text-center" style={{ color: "var(--accent)" }}>{jackpotLabel}</th>'
);
content = content.replace(
    '<th className="py-3 px-4 text-center text-slate-400">{highPrizeLabel}</th>',
    '<th className="py-3 px-4 text-center text-muted-foreground">{highPrizeLabel}</th>'
);

// 6. Replace tbody
content = content.replace(
    '<tbody className="divide-y divide-slate-100">',
    '<tbody className="divide-y divide-border/30">'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Precision update TopSystemsAnalysis');
