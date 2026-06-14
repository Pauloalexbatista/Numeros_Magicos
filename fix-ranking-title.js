const fs = require('fs');
let code = fs.readFileSync('src/app/ranking/[game]/page.tsx', 'utf8');

// Fix GAME_NAMES
code = code.replace(
  "    [GameType.EUROMILLIONS]: 'Euromilhes',",
  "    [GameType.EUROMILLIONS]: 'Euromilhões',"
);

// Translate Title
code = code.replace(
  "Ranking de Sistemas - {GAME_NAMES[gameType]}",
  "{t('title')} - {GAME_NAMES[gameType]}"
);

fs.writeFileSync('src/app/ranking/[game]/page.tsx', code, 'utf8');
console.log('Fixed title and GAME_NAMES!');
