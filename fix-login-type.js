const fs = require('fs');

const file = 'src/app/login/page.tsx';
let content = fs.readFileSync(file, 'utf8');

if (content.includes("const gameConfig: Record<'euro' | 'toto' | 'dream' | 'mega', any> = {")) {
    content = content.replace("const gameConfig: Record<'euro' | 'toto' | 'dream' | 'mega', any> = {", "const gameConfig = {");
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed login page gameConfig type.');
}
