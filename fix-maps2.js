const fs = require('fs');
const path = require('path');

function findFiles(dir, files = []) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
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

    if (content.includes('Record<GameType, string>') && !content.includes("[GameType.MEGASENA]: 'Mega-Sena'")) {
        content = content.replace(/\[GameType\.EURODREAMS\]:\s*['"]EuroDreams['"]/g, "[GameType.EURODREAMS]: 'EuroDreams',\n    [GameType.MEGASENA]: 'Mega-Sena'");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log("Fixed MAPS in " + file);
    }
}
