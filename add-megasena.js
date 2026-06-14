const fs = require('fs');
let content = fs.readFileSync('src/types/game.ts', 'utf8');

if (!content.includes('MEGASENA =')) {
    content = content.replace(/EURODREAMS = 'EURODREAMS'/, "EURODREAMS = 'EURODREAMS',\n    MEGASENA = 'MEGASENA'");
    
    const megaSenaConfig = `
    [GameType.MEGASENA]: {
        id: GameType.MEGASENA,
        name: 'Mega-Sena',
        slug: 'megasena',
        rules: {
            mainCount: 6,
            mainRange: 60,
            bonusCount: 0,
            bonusRange: 0,
            bonusLabel: ''
        },
        ui: {
            accent: 'var(--mega-accent)',
            gradient: 'linear-gradient(180deg, rgba(245,158,11,0.07), rgba(252,211,77,0.03) 60%, transparent 100%)',
            flag: '????',
            themeGrad: 'from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300'
        }
    }`;
    
    // Insert before the last closing brace of GAMES object
    content = content.replace(/(\s*)\};/, `,${megaSenaConfig}$1};`);
    
    fs.writeFileSync('src/types/game.ts', content, 'utf8');
    console.log('Added Mega-Sena to game.ts');
} else {
    console.log('Mega-Sena already exists in game.ts');
}
