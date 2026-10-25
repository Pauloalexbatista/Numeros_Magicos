const fs = require('fs');
let content = fs.readFileSync('src/services/star-systems.ts', 'utf8');

content = content.replace(/\r\n/g, '\n');
content = content.replace(/    new LateStarsSystem\(\),\n/, '');

const classStart = content.indexOf('// 2. Late Stars');
const classEnd = content.indexOf('// 3. Markov Stars');

if (classStart !== -1 && classEnd !== -1) {
    content = content.substring(0, classStart) + content.substring(classEnd);
    fs.writeFileSync('src/services/star-systems.ts', content, 'utf8');
    console.log('Successfully removed LateStarsSystem');
} else {
    console.error('Could not locate boundaries');
    process.exit(1);
}
