const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/[game]/page.tsx', 'utf8');

if (!code.includes('import { GAMES } from ')) {
  code = code.replace('import { GameType } from \'@/types/game\';', 'import { GameType, GAMES } from \'@/types/game\';');
}

const mapStart = code.indexOf('const GAME_MAP: Record<string, GameType> = {');
if (mapStart > -1) {
  const mapEnd = code.indexOf('};', mapStart) + 2;
  code = code.substring(0, mapStart) + code.substring(mapEnd);
}

const namesStart = code.indexOf('const GAME_NAMES: Record<GameType, string> = {');
if (namesStart > -1) {
  const namesEnd = code.indexOf('};', namesStart) + 2;
  code = code.substring(0, namesStart) + code.substring(namesEnd);
}

const flagsStart = code.indexOf('const GAME_FLAGS: Record<GameType, string> = {');
if (flagsStart > -1) {
  const flagsEnd = code.indexOf('};', flagsStart) + 2;
  code = code.substring(0, flagsStart) + code.substring(flagsEnd);
}

code = code.replace('const gameType = GAME_MAP[gameKey];', 'const gameConfig = Object.values(GAMES).find(g => g.slug === gameKey);\n    const gameType = gameConfig?.id;');

code = code.split('GAME_NAMES[gameType]').join('gameConfig.name');
code = code.split('GAME_FLAGS[gameType]').join('gameConfig.ui.flag');

const themeStart = code.indexOf('const themeGrad: Record<GameType, string> = {');
if (themeStart > -1) {
  const themeEnd = code.indexOf('|| \'from-blue-400 to-indigo-400\';', themeStart) + 39;
  code = code.substring(0, themeStart) + 'const titleGrad = gameConfig?.ui.themeGrad;' + code.substring(themeEnd);
}

fs.writeFileSync('src/app/dashboard/[game]/page.tsx', code, 'utf8');
console.log('Updated page.tsx safely');