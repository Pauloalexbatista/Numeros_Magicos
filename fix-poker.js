const fs = require('fs');
let code = fs.readFileSync('src/app/games/page.tsx', 'utf8');

code = code.replace(/'europoker'/g, "'euromillions'");

fs.writeFileSync('src/app/games/page.tsx', code, 'utf8');
console.log("Fixed europoker typo.");
