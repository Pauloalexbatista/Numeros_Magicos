const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. BackButton
content = content.replace(
  /<BackButton href=\{`\/ranking\/\$\{game\}`\} \/>/g,
  "<BackButton href={`/ranking/${game}`} style={{ boxShadow: `0 0 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)`, border: `1px solid color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)` }} />"
);

// 2. Next Prediction Card & Title & Button
// We'll replace the whole block from <Card className={`p-6 sm:p-8... to </Card> roughly. Wait, that's too big.
// Let's replace the card tag
content = content.replace(
  /<Card className=\{`p-6 sm:p-8 glass-card border border-border shadow-sm relative overflow-hidden group rounded-2xl`\}>/g,
  "<Card className={`p-6 sm:p-8 glass-card border shadow-sm relative overflow-hidden group rounded-2xl`} style={{ backgroundColor: `color-mix(in srgb, ${gameConfig.ui.accent} 5%, transparent)`, borderColor: `color-mix(in srgb, ${gameConfig.ui.accent} 20%, transparent)` }}>"
);

// Replace title and original button block
const oldTitleBlock = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">\n                        <h2 className={\`text-xl font-extrabold \${currentTheme.accentText} flex items-center gap-2 shrink-0\`}>\n                            <span className="animate-pulse">?</span> Próxima Previsão\n                        </h2>\n                        {nextPrediction && nextPrediction.length > 0 && (\n                            <SendToWheelingButton\n                                numbers={nextPrediction}\n                                label="Enviar para Desdobramentos"\n                                className="shadow-sm border-none bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-bold hover:scale-102 transition-transform py-2.5 px-4"\n                            />\n                        )}\n                    </div>`;

const newTitleBlock = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">\n                        <h2 className={\`text-xl font-extrabold text-white flex items-center gap-2 shrink-0\`} style={{ textShadow: \`0 0 15px \${gameConfig.ui.accent}\` }}>\n                            <span className="animate-pulse" style={{ color: gameConfig.ui.accent }}>?</span> Próxima Previsão\n                        </h2>\n                    </div>`;

if(content.includes('from-indigo-500')) {
    // try literal replace
    const lines = content.split('\n');
    let inCard = false;
    for(let i=0; i<lines.length; i++) {
        if(lines[i].includes('Próxima Previsão')) {
            // Found title. We'll manually wipe the SendToWheelingButton
            lines[i-1] = `                        <h2 className={\`text-xl font-extrabold text-white flex items-center gap-2 shrink-0\`} style={{ textShadow: \`0 0 15px \${gameConfig.ui.accent}\` }}>`;
            lines[i] = `                            <span className="animate-pulse" style={{ color: gameConfig.ui.accent }}>?</span> Próxima Previsão`;
            // wipe button lines
            for(let j=i+2; j<i+10; j++) {
                if(lines[j].includes('SendToWheelingButton')) {
                    lines[j] = '';
                    lines[j+1] = '';
                    lines[j+2] = '';
                    lines[j+3] = '';
                    lines[j+4] = '';
                    lines[j+5] = '';
                    break;
                }
            }
        }
        
        if(lines[i].includes('Sugestão para o próximo sorteio')) {
            lines[i-1] = `                    <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between mt-6 relative z-10 gap-4">\n                        <p className="text-muted-foreground text-xs sm:text-sm font-medium">\n                            Sugestão para o próximo sorteio baseada no algoritmo {formatSystemName(system.name)}.\n                        </p>\n                        {nextPrediction && nextPrediction.length > 0 && (\n                            <SendToWheelingButton\n                                numbers={nextPrediction}\n                                label="Enviar para Desdobramentos"\n                                className="shadow-sm border border-white/20 text-white font-bold hover:scale-105 transition-all py-2.5 px-6 rounded-full"\n                                style={{ backgroundColor: gameConfig.ui.accent, boxShadow: \`0 4px 15px color-mix(in srgb, \${gameConfig.ui.accent} 50%, transparent)\` }}\n                            />\n                        )}\n                    </div>`;
            lines[i] = '';
            lines[i+1] = '';
        }
    }
    content = lines.join('\n');
}

// 3. Fix hit balls!
const badHitRegex = /<span key=\{idx\} className=\{`\s+w-6 h-6 flex items-center justify-center rounded-full text-\[10px\] font-bold\s+\$\{isHit \? '\$\{currentTheme\.accentBg\} text-white shadow-\[0_0_10px_var\(--glow\)\] border border-white\/20' : 'bg-card\/50 backdrop-blur-sm border border-border text-muted-foreground'\}\s+`\}>/g;

content = content.replace(
  badHitRegex,
  "<span key={idx} className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${isHit ? 'text-white border border-white/20 shadow-md' : 'bg-card/50 backdrop-blur-sm border border-border text-muted-foreground'}`} style={isHit ? { backgroundColor: gameConfig.ui.accent, boxShadow: `0 0 12px color-mix(in srgb, ${gameConfig.ui.accent} 60%, transparent)` } : {}}>"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed page items');
