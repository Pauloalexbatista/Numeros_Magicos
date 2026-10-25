const fs = require('fs');
let content = fs.readFileSync('src/services/ranked-systems.ts', 'utf8');

const target = `    {
        name: 'Mais Atrasados',
        description: 'Numeros ordenados pelo numero de sorteios desde a ultima aparicao (mais atrasado primeiro) ate ao 1o sorteio',
        generateTop10: generateLateNumbers
    },`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');

if (!normContent.includes(normTarget)) {
    console.error('Target Mais Atrasados not found in ranked-systems.ts');
    process.exit(1);
}

fs.writeFileSync('src/services/ranked-systems.ts', normContent.replace(normTarget, ''), 'utf8');
console.log('Successfully removed Mais Atrasados from ranked-systems.ts');
