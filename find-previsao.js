const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

let lines = content.split('\n');
let index = lines.findIndex(line => line.includes('Próxima Previsão') || line.includes('Sugestão para o próximo'));
if (index !== -1) {
    console.log(lines.slice(Math.max(0, index - 10), index + 20).join('\n'));
} else {
    console.log('Not found');
}
