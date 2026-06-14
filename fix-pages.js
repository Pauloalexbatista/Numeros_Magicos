const fs = require('fs');
const glob = require('fs').readdirSync;

function findFiles(dir, files = []) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = dir + '/' + file;
        if (fs.statSync(fullPath).isDirectory()) {
            findFiles(fullPath, files);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            files.push(fullPath);
        }
    });
    return files;
}

const allTsx = findFiles('src/app');

for (const file of allTsx) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Fix ranking/[game]/page.tsx undefined variables
    if (file.includes('ranking') && file.endsWith('page.tsx')) {
        if (!content.includes("const gameConfig = GAMES[gameType];") && content.includes("gameConfig?.ui.accent")) {
            content = content.replace(/const currentTheme = gameThemeMap\[gameType\][\s\S]*?;/, 
                "const currentTheme = gameThemeMap[gameType] || gameThemeMap[GameType.EUROMILLIONS];\n    const gameConfig = GAMES[gameType];");
            changed = true;
        }
        
        // Add MEGASENA to maps
        if (!content.includes("'megasena': GameType.MEGASENA")) {
            content = content.replace(/'euromillions': GameType\.EUROMILLIONS,/, "'euromillions': GameType.EUROMILLIONS,\n    'megasena': GameType.MEGASENA,");
            content = content.replace(/\[GameType\.EUROMILLIONS\]: 'Euromilhões',/i, "[GameType.EUROMILLIONS]: 'Euromilhões',\n    [GameType.MEGASENA]: 'Mega-Sena',");
            content = content.replace(/\[GameType\.EUROMILLIONS\]: \{/i, `[GameType.MEGASENA]: {
        textGrad: 'from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300',
        btnActive: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50',
        rank1: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50',
        jackpotText: 'text-amber-600 dark:text-amber-400',
    },\n    [GameType.EUROMILLIONS]: {`);
            changed = true;
        }
    }

    // Check others
    if (content.includes("gameConfig?.ui.accent") && !content.includes("const gameConfig")) {
        console.log("WARNING: " + file + " uses gameConfig but it's not defined!");
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log("Fixed " + file);
    }
}

// ----------------------------------------------------
// FIX LOGIN PAGE
let loginPath = 'src/app/login/page.tsx';
let loginContent = fs.readFileSync(loginPath, 'utf8');

const badConfig = `const gameConfig: Record<'euro' | 'toto' | 'dream', any> = {`;
if (loginContent.includes(badConfig)) {
    loginContent = loginContent.replace(/const gameConfig: Record\<'euro' \| 'toto' \| 'dream', any\> = \{[\s\S]*?\}\[game\];/m, `const gameConfig: Record<'euro' | 'toto' | 'dream' | 'mega', any> = {
    euro: { label: 'Euromilhões', slug: 'euromillions', accent: 'var(--euro-accent)', accent2: 'var(--euro-accent-2)', glow: 'var(--euro-glow)', border: 'var(--euro-border)', surface: 'var(--euro-surface)', text: 'var(--euro-text)' },
    toto: { label: 'Totoloto', slug: 'totoloto', accent: 'var(--toto-accent)', accent2: 'var(--toto-accent-2)', glow: 'var(--toto-glow)', border: 'var(--toto-border)', surface: 'var(--toto-surface)', text: 'var(--toto-text)' },
    dream: { label: 'EuroDreams', slug: 'eurodreams', accent: 'var(--dream-accent)', accent2: 'var(--dream-accent-2)', glow: 'var(--dream-glow)', border: 'var(--dream-border)', surface: 'var(--dream-surface)', text: 'var(--dream-text)' },
    mega: { label: 'Mega-Sena', slug: 'megasena', accent: 'var(--mega-accent)', accent2: 'var(--mega-accent-2)', glow: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', surface: 'rgba(245, 158, 11, 0.05)', text: 'var(--foreground)' },
  }[game];`);
    fs.writeFileSync(loginPath, loginContent, 'utf8');
    console.log("Fixed login page gameConfig.");
}
