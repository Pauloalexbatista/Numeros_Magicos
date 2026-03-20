const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('src/app/admin/health/page.tsx', 'utf8');
try {
    const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        errorRecovery: true
    });
    
    traverse(ast, {
        ReturnStatement(path) {
            if (path.node.argument && path.node.argument.type === 'JSXElement') {
                console.log("Root JSX Element spans from line", path.node.argument.loc.start.line, "to", path.node.argument.loc.end.line);
                const lines = code.split('\n');
                console.log("End line content: ", lines[path.node.argument.loc.end.line - 1]);
            }
        }
    });
} catch (e) {
    console.error(e);
}
