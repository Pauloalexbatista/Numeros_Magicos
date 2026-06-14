const fs = require('fs');
const file = 'src/components/dashboard/TopStarSystemsWidget.tsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace('border-border"}`>', 'border-border"}`}>');
fs.writeFileSync(file, c, 'utf8');
console.log('Fixed ' + file);