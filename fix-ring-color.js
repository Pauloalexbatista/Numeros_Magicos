const fs = require('fs');

const file = 'src/components/dashboard/RecommendedBetWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/ringColor: 'rgba\(255,255,255,0\.18\)',/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed ringColor.');
