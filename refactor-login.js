const fs = require('fs');
const loginFile = 'src/app/login/page.tsx';
let loginContent = fs.readFileSync(loginFile, 'utf8');

// Injecting --accent and --glow into the wrapper
loginContent = loginContent.replace('<div className="min-h-screen bg-background text-foreground flex flex-col font-sans">', '<div className="min-h-screen bg-background text-foreground flex flex-col font-sans" style={{"--accent": gameConfig.accent, "--glow": gameConfig.glow, "--accent-border": gameConfig.border} as React.CSSProperties}>');

// Add the glow background
loginContent = loginContent.replace('<main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col justify-center relative">', '<main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col justify-center relative">\n          <div className="game-glow-bg" />');

// Update StatCard wrapper
loginContent = loginContent.replace('className="rounded-2xl border border-border/70 bg-surface-1/60 px-4 py-4 shadow-sm"', 'className="glass-card px-4 py-4 relative group"');

// Update login box
loginContent = loginContent.replace('className="w-full lg:w-[420px] rounded-3xl border border-border/70 bg-surface-1/50 p-8 shadow-sm backdrop-blur-md relative"', 'className="w-full lg:w-[420px] glass-card p-8 relative"');

// Update submit button
// <button disabled={!acceptedTerms} onClick={handleEnter} className="w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 inline-flex items-center justify-center gap-2" style={{ backgroundColor: acceptedTerms ? gameConfig.accent : 'var(--surface-2)', color: acceptedTerms ? '#fff' : 'var(--text-disabled)', cursor: acceptedTerms ? 'pointer' : 'not-allowed', boxShadow: acceptedTerms ? `0 14px 40px ${gameConfig.accent}35` : 'none' }}>
loginContent = loginContent.replace(/<button disabled=\{!acceptedTerms\}.*?boxShadow:.*?none' \}\}>/g, '<button disabled={!acceptedTerms} onClick={handleEnter} className="glass-button w-full py-3.5 px-4 text-sm">');

fs.writeFileSync(loginFile, loginContent, 'utf8');
console.log('Login page refactored');
