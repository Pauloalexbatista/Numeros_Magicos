const fs = require('fs');
const parser = require('@babel/parser');

try {
    const code = fs.readFileSync('src/app/admin/health/page.tsx', 'utf8');
    parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
    });
    console.log("No syntax errors found by Babel.");
} catch (e) {
    console.error("Syntax Error at line", e.loc.line, "col", e.loc.column);
    console.error(e.message);
    const lines = fs.readFileSync('src/app/admin/health/page.tsx', 'utf8').split('\n');
    for (let i = Math.max(0, e.loc.line - 5); i < Math.min(lines.length, e.loc.line + 5); i++) {
        console.log(`${i+1}: ${lines[i]}`);
    }
}
