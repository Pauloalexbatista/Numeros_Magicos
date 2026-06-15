const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace mangled Portuguese words
content = content.replace(/Pr.xima/g, 'Próxima');
content = content.replace(/Previs.o/g, 'Previsão');
content = content.replace(/Sugest.o/g, 'Sugestão');
content = content.replace(/pr.ximo/g, 'próximo');
content = content.replace(/Hist.rico/g, 'Histórico');
content = content.replace(/M.dia/g, 'Média');
content = content.replace(/Frequ.ncia/g, 'Frequência');
content = content.replace(/Previs.es/g, 'Previsões');
content = content.replace(/.ltimos/g, 'Últimos');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed portuguese accents in page.tsx');
