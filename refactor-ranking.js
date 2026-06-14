const fs = require('fs');
const rankFile = 'src/app/ranking/[game]/page.tsx';
let rankContent = fs.readFileSync(rankFile, 'utf8');

rankContent = rankContent.replace(/<div className="min-h-screen bg-surface-1 text-foreground.*?style=\{\{([\s\S]*?)\} as React\.CSSProperties\}>/, '<div className="min-h-screen bg-surface-1 text-foreground p-4 sm:p-6 pb-24 font-sans transition-all duration-500 relative" style={{\n$1,\n"--glow": gameConfig?.ui.glow,\n} as React.CSSProperties}>\n<div className="game-glow-bg" />');

rankContent = rankContent.replace(/className="flex items-center justify-between rounded-2xl border border-border bg-surface-1\/60 p-4 shadow-sm backdrop-blur-md"/g, 'className="flex items-center justify-between glass-card p-4 relative"');

fs.writeFileSync(rankFile, rankContent, 'utf8');
console.log('Ranking page refactored');
