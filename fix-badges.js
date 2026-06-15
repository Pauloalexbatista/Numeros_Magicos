const fs = require('fs');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the specific badge classes
    content = content.replace(/'bg-transparent text-black dark:text-white border border-black dark:border-white'/g, "'bg-transparent text-game-badge-low-text border border-game-badge-low-border'");
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed ' + file);
}

fixFile('src/app/ranking/[game]/[systemName]/page.tsx');
fixFile('src/app/analysis/stars/ranking/[game]/[systemName]/page.tsx');
