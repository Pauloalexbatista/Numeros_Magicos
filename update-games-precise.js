const fs = require('fs');
let code = fs.readFileSync('src/app/games/page.tsx', 'utf8');

// Fix Euromillions ID
code = code.replace(/id: 'europoker',/g, "id: 'euromillions',");

// Add flags to titles
code = code.replace(/title: 'Euromilhões',/g, "title: '🇪🇺 Euromilhões',");
code = code.replace(/title: 'Totoloto',/g, "title: '🇵🇹 Totoloto',");
code = code.replace(/title: 'EuroDreams',/g, "title: '🇪🇺 EuroDreams',");
code = code.replace(/title: 'Mega-Sena',/g, "title: '🇧🇷 Mega-Sena',");

fs.writeFileSync('src/app/games/page.tsx', code, 'utf8');
