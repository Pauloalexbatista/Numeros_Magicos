const fs = require('fs');
const file = 'src/components/SendToWheelingButton.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the cn(...) call with a conditional merge
content = content.replace(
  /className=\{cn\('px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center gap-2', className\)\}/,
  "className={cn('px-4 py-2 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold rounded-lg transition-all flex items-center gap-2', className || 'bg-purple-600 hover:bg-purple-700 text-white')}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed background merging');
