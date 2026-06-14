const fs = require('fs');
const analysisFile = 'src/components/AnalysisClient.tsx';
let content = fs.readFileSync(analysisFile, 'utf8');

// Replace standard stats cards
content = content.replace(/className="bg-card\/50 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-border"/g, 'className="glass-card p-4"');
content = content.replace(/className="bg-card\/50 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-border md:col-span-2"/g, 'className="glass-card p-4 md:col-span-2"');

// Replace grids
content = content.replace(/className="bg-card\/50 backdrop-blur-sm rounded-lg shadow-sm border border-border p-4"/g, 'className="glass-card p-4"');

// Also inside the main page, we need to make sure the page wrapper injects the css vars
// Wait, AnalysisClient doesn't have the page wrapper. The page wrapper is in `src/app/analysis/page.tsx`!

fs.writeFileSync(analysisFile, content, 'utf8');
console.log('AnalysisClient refactored');
