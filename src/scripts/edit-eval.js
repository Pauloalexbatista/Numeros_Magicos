const fs = require('fs');
let content = fs.readFileSync('src/services/ranking-evaluator.ts', 'utf8');

content = content.replace(
    /                \/\/ Check if performance already exists in SystemPerformance[\s\S]*?\/\/ Also save to SystemPerformanceFullPool/,
    `                // Save to SystemPerformanceFullPool`
);

fs.writeFileSync('src/services/ranking-evaluator.ts', content, 'utf8');
