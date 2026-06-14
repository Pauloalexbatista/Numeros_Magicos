const fs = require('fs');
let content = fs.readFileSync('scripts/update-all-games.ts', 'utf8');

// Replace the end with only processGame('MEGASENA')
content = content.replace(/async function main\(\) \{[\s\S]*?main\(\)\.catch/g, `async function main() {
    console.log('?? Starting Mega-Sena Recalculation...\\n');
    await processGame('MEGASENA');
    console.log('\\n? Done!');
}

main().catch`);

fs.writeFileSync('scripts/update-megasena.ts', content, 'utf8');
console.log('Created update-megasena.ts');
