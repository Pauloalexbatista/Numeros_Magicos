const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove Crystal ball
const ballStart = content.indexOf('<div className="absolute top-0 right-0 p-4 text-zinc-300/30 dark:text-zinc-700/20 group-hover:scale-110 transition-transform duration-300">');
if(ballStart !== -1) {
    const ballEnd = content.indexOf('</div>', ballStart) + 6;
    content = content.substring(0, ballStart) + content.substring(ballEnd);
    console.log('Crystal ball removed.');
}

// 2. Title and top button removal
const h2Start = content.indexOf('<h2 className={`text-xl font-extrabold ${currentTheme.accentText} flex items-center gap-2 shrink-0`}>');
if (h2Start !== -1) {
    const nextDiv = content.indexOf('</div>', h2Start); // This is the end of the flex container holding title and top button
    // Let's replace the whole h2 ... nextDiv
    const replacementTitle = `<h2 className="text-xl font-extrabold text-white flex items-center gap-2 shrink-0" style={{ textShadow: \`0 0 15px \${gameConfig.ui.accent}\` }}>
                            <span className="animate-pulse" style={{ color: gameConfig.ui.accent }}>?</span> Próxima Previsão
                        </h2>\n                    `;
    content = content.substring(0, h2Start) + replacementTitle + content.substring(nextDiv);
    console.log('Title replaced and top button removed.');
}

// 3. Bottom button addition
const pTextStart = content.indexOf('<p className="text-muted-foreground text-xs sm:text-sm mt-6 relative z-10 font-medium">');
if (pTextStart !== -1) {
    const pTextEnd = content.indexOf('</p>', pTextStart) + 4;
    const oldP = content.substring(pTextStart, pTextEnd);
    const newBottomBlock = `<div className="flex flex-col sm:flex-row items-end sm:items-center justify-between mt-6 relative z-10 gap-4">
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
    content = content.substring(0, pTextStart) + newBottomBlock + content.substring(pTextEnd);
    console.log('Bottom button added.');
}

fs.writeFileSync(file, content, 'utf8');
