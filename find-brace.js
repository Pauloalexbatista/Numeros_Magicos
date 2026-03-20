const fs = require('fs');
let code = fs.readFileSync('src/app/admin/health/page.tsx', 'utf8');

// remove block comments
code = code.replace(/\/\*[\s\S]*?\*\//g, '');
// remove line comments
code = code.replace(/\/\/.*/g, '');
// remove strings
code = code.replace(/'[^']*'/g, '');
code = code.replace(/"[^"]*"/g, '');
// remove template literals (crude but usually works if no nested templates)
code = code.replace(/`[\s\S]*?`/g, '');

let stack = [];
for (let i = 0; i < code.length; i++) {
   if (code[i] === '{') stack.push(i);
   if (code[i] === '}') {
       if (stack.length > 0) stack.pop();
   }
}
console.log('Unmatched { count:', stack.length);
if (stack.length > 0) {
    const idx = stack[0];
    console.log('First unmatched { at:', code.substring(Math.max(0, idx - 50), idx + 150));
}
