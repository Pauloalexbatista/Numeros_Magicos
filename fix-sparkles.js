const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<span className="animate-pulse" style=\{\{ color: gameConfig\.ui\.accent \}\}>.<\/span> Próxima Previsão/g, '<span className="animate-pulse" style={{ color: gameConfig.ui.accent }}>\\u2728</span> Próxima Previsão');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed sparkles emoji');
