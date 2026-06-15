const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Análise Histórica Button
content = content.replace(
  /className=\{`px-4 py-2 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2 text-sm \$\{currentTheme\.btn\}`\}/g,
  `className="px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm bg-surface-1/50 hover:bg-surface-2 border"\n                            style={{ borderColor: gameConfig.ui.accent, color: gameConfig.ui.accent, boxShadow: \`0 4px 15px color-mix(in srgb, \${gameConfig.ui.accent} 40%, transparent)\` }}`
);

// 2. Remove Crystal Ball Icon
const crystalBallStr = `<div className="absolute top-0 right-0 p-4 text-zinc-300/30 dark:text-zinc-700/20 group-hover:scale-110 transition-transform duration-300">\n                        <span className="text-9xl filter drop-shadow-sm select-none">??</span>\n                    </div>`;
content = content.replace(crystalBallStr, "");

// 3. Fix Próxima Previsão Title and Remove Top SendToWheelingButton
const topTitleBlockStrRegex = /<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">\s*<h2 className={`text-xl font-extrabold \$\{currentTheme\.accentText\} flex items-center gap-2 shrink-0`}>\s*<span className="animate-pulse">?<\/span> Próxima Previsão\s*<\/h2>\s*\{nextPrediction && nextPrediction\.length > 0 && \(\s*<SendToWheelingButton\s*numbers=\{nextPrediction\}\s*label="Enviar para Desdobramentos"\s*className="shadow-sm border-none bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-bold hover:scale-102 transition-transform py-2\.5 px-4"\s*\/>\s*\)\}\s*<\/div>/g;

const newTopTitleBlockStr = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <h2 className="text-xl font-extrabold text-white flex items-center gap-2 shrink-0" style={{ textShadow: \`0 0 15px \${gameConfig.ui.accent}\` }}>
                            <span className="animate-pulse" style={{ color: gameConfig.ui.accent }}>?</span> Próxima Previsão
                        </h2>
                    </div>`;
content = content.replace(topTitleBlockStrRegex, newTopTitleBlockStr);

// 4. Illuminate Próxima Previsão balls
const oldBallsRegex = /<div className=\{`\s+relative w-11 h-11 flex items-center justify-center rounded-full text-xl font-black shadow-md border-2\s+bg-card\/50 backdrop-blur-sm text-foreground\s+hover:scale-105 transition-transform cursor-default\s+`\}>/g;
const newBallsStr = `<div className="relative w-11 h-11 flex items-center justify-center rounded-full text-xl font-black shadow-md border-2 bg-card/50 backdrop-blur-sm hover:scale-105 transition-transform cursor-default" style={{ borderColor: gameConfig.ui.accent, color: gameConfig.ui.accent, boxShadow: \`0 0 15px color-mix(in srgb, \${gameConfig.ui.accent} 40%, transparent), inset 0 0 10px color-mix(in srgb, \${gameConfig.ui.accent} 20%, transparent)\` }}>`;
content = content.replace(oldBallsRegex, newBallsStr);

// 5. Add SendToWheelingButton at the bottom
const oldBottomPStrRegex = /<p className="text-muted-foreground text-xs sm:text-sm mt-6 relative z-10 font-medium">\s*Sugestão para o próximo sorteio baseada no algoritmo \{formatSystemName\(system\.name\)\}\.\s*<\/p>/g;
const newBottomPStr = `<div className="flex flex-col sm:flex-row items-end sm:items-center justify-between mt-6 relative z-10 gap-4">
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                            Sugestão para o próximo sorteio baseada no algoritmo {formatSystemName(system.name)}.
                        </p>
                        {nextPrediction && nextPrediction.length > 0 && (
                            <SendToWheelingButton
                                numbers={nextPrediction}
                                label="Enviar para Desdobramentos"
                                className="px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm bg-surface-1/50 hover:bg-surface-2 border"
                                style={{ borderColor: gameConfig.ui.accent, color: gameConfig.ui.accent, boxShadow: \`0 4px 15px color-mix(in srgb, \${gameConfig.ui.accent} 40%, transparent)\` }}
                            />
                        )}
                    </div>`;
content = content.replace(oldBottomPStrRegex, newBottomPStr);


fs.writeFileSync(file, content, 'utf8');
console.log('Final polish done!');
