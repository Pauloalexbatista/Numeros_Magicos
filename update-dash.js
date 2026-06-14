const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/[game]/page.tsx', 'utf8');

// Replace local GAME_MAP and GAME_NAMES with imports from config
if (!code.includes('import { GAMES } from ')) {
  code = code.replace('import { GameType } from \'@/types/game\';', 'import { GameType, GAMES } from \'@/types/game\';');
}

// Remove redundant GAME_MAP, GAME_NAMES, GAME_FLAGS
code = code.replace(/const GAME_MAP[^}]+};/s, '');
code = code.replace(/const GAME_NAMES[^}]+};/s, '');
code = code.replace(/const GAME_FLAGS[^}]+};/s, '');

// Fix the lookup
code = code.replace('const gameType = GAME_MAP[gameKey];', 'const gameConfig = Object.values(GAMES).find(g => g.slug === gameKey);\n    const gameType = gameConfig?.id;');

// Fix names and flags
code = code.replace(/GAME_NAMES\\[gameType\\=/g, 'gameConfig.name');
code = code.replace(/GAME_FLAGS\\[gameType\\=/g, 'gameConfig.ui.flag');

// Fix themeGrad
code = code.replace(/const themeGrad: Record<GameType, string> = \{[^}]+\};\\s*const titleGrad = themeGrad[gameType] \\|\\| \'[{^\']+\';/s, 'const titleGrad = gameConfig?.ui.themeGrad || \' \';');


fs.writeFileSync('src/app/dashboard/[game]/page.tsx', code, 'utf8');
console.log('Updated page.tsx');