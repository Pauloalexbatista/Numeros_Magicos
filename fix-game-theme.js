const fs = require('fs');
const file = 'src/utils/game-theme.ts';
let content = fs.readFileSync(file, 'utf8');

const megaSenaBlock = `    [GameType.MEGASENA]: {
        id: GameType.MEGASENA,
        name: 'Mega-Sena',
        colors: {
            primary: '#f59e0b',
            secondary: '#d97706',
            accent: '#fcd34d',
            light: '#fef3c7',
            dark: '#b45309'
        },
        gradient: {
            from: '#b45309',
            to: '#f59e0b',
            css: 'from-amber-700 to-amber-500'
        },
        textGradient: 'from-amber-400 to-yellow-400',
        borderColor: 'border-amber-500',
        hoverBorder: 'hover:border-amber-400'
    },
    [GameType.EUROMILLIONS]:`;

if (!content.includes('[GameType.MEGASENA]')) {
    content = content.replace(/\[GameType\.EUROMILLIONS\]:/, megaSenaBlock);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed game-theme.ts');
}
