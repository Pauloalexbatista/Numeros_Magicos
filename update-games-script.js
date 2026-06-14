const fs = require('fs');
let content = fs.readFileSync('scripts/update-all-games.ts', 'utf8');

// Update function signature
content = content.replace(/async function processGame\(game: 'EUROMILLIONS' \| 'TOTOLOTO' \| 'EURODREAMS'\)/g, "async function processGame(game: 'EUROMILLIONS' | 'TOTOLOTO' | 'EURODREAMS' | 'MEGASENA')");

// Update main call
if (content.includes('const games = [')) {
    content = content.replace(/const games = \['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'\] as const;/, "const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA'] as const;");
} else {
    // Manually add the array if it looks different
    content = content.replace(/await processGame\('EUROMILLIONS'\);[\s\S]*?await processGame\('EURODREAMS'\);/g, "await processGame('EUROMILLIONS');\n    await processGame('TOTOLOTO');\n    await processGame('EURODREAMS');\n    await processGame('MEGASENA');");
}

fs.writeFileSync('scripts/update-all-games.ts', content, 'utf8');
console.log('Added Mega-Sena to update-all-games.ts');
