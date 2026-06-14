const fs = require('fs');
const files = [
    'src/components/dashboard/HistoricalBestWidget.tsx',
    'src/components/dashboard/StarJackpotLeaders.tsx',
    'src/components/dashboard/LastDrawStarSystems.tsx'
];

for (const file of files) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace('border-border"}`>', 'border-border"}`}>');
    fs.writeFileSync(file, c, 'utf8');
    console.log('Fixed ' + file);
}