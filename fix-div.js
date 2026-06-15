const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<h2 className="text-xl font-extrabold text-white flex items-center gap-2 shrink-0" style={{ textShadow: \`0 0 15px \${gameConfig.ui.accent}\` }}>
                            <span className="animate-pulse" style={{ color: gameConfig.ui.accent }}>?</span> Próxima Previsão
                        </h2>`;

if (content.includes(targetStr)) {
    // Add the missing </div> right after this h2 block!
    const fixStr = targetStr + '\n                    </div>';
    content = content.replace(targetStr, fixStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed missing div closing tag!');
} else {
    console.log('Could not find the h2 string');
}
