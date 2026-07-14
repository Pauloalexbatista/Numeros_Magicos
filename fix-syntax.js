const fs = require('fs');
const file = 'src/app/analysis/history/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("const recoveryStats,\n        radarStats\n    };", "");

fs.writeFileSync(file, content, 'utf8');
