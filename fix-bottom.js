const fs = require('fs');
const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    // 1. Remove Crystal Ball
    if (lines[i].includes('text-9xl filter drop-shadow-sm select-none')) {
        lines[i-1] = '';
        lines[i] = '';
        lines[i+1] = '';
    }

    // 2. Fix Top Title Block & Remove old button
    if (lines[i].includes('text-xl font-extrabold') && lines[i].includes('currentTheme.accentText')) {
        lines[i] = `                        <h2 className="text-xl font-extrabold text-white flex items-center gap-2 shrink-0" style={{ textShadow: \`0 0 15px \${gameConfig.ui.accent}\` }}>`;
        lines[i+1] = `                            <span className="animate-pulse" style={{ color: gameConfig.ui.accent }}>?</span> Próxima Previsão`;
        
        // Remove the button that comes after
        for (let j = i+3; j < i+12; j++) {
            if (lines[j].includes('<SendToWheelingButton')) {
                // clear this and next 6 lines
                for (let k = j-1; k <= j+6; k++) {
                    lines[k] = '';
                }
                break;
            }
        }
    }

    // 3. Add new button at the bottom
    if (lines[i].includes('Sugestão para o próximo sorteio baseada no algoritmo')) {
        // the original was wrapped in a <p> over 3 lines
        if (lines[i-1].includes('<p className="text-muted-foreground')) {
            lines[i-1] = `                    <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between mt-6 relative z-10 gap-4">\n                        <p className="text-muted-foreground text-xs sm:text-sm font-medium">`;
            // lines[i] stays the same
            lines[i+1] = `                        </p>\n                        {nextPrediction && nextPrediction.length > 0 && (\n                            <SendToWheelingButton\n                                numbers={nextPrediction}\n                                label="Enviar para Desdobramentos"\n                                className="px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm bg-surface-1/50 hover:bg-surface-2 border"\n                                style={{ borderColor: gameConfig.ui.accent, color: gameConfig.ui.accent, boxShadow: \`0 4px 15px color-mix(in srgb, \${gameConfig.ui.accent} 40%, transparent)\` }}\n                            />\n                        )}\n                    </div>`;
        }
    }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Fixed crystal ball and button');
