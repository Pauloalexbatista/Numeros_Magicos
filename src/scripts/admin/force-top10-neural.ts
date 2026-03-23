import fs from 'fs';
import path from 'path';

// This script normalizes the generated output format of all neural models 
// from a bulky 25 (or 20) array to a strict top 10 limit array, to align with the rest of the application ranking.

function patchFile(filepath: string, patches: { from: RegExp, to: string }[]) {
    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;
    for (const { from, to } of patches) {
        if (from.test(content)) {
            content = content.replace(from, to);
            modified = true;
        }
    }
    if (modified) {
        fs.writeFileSync(filepath, content);
        console.log(`✅ Patched: ${path.basename(filepath)}`);
    }
}

// 1. titan-light.ts, titan-rf.ts, titan-lstm.ts
const scriptsPath = path.join(process.cwd(), 'src/scripts');
['titan-light.ts', 'titan-rf.ts', 'titan-lstm.ts'].forEach(file => {
    patchFile(path.join(scriptsPath, file), [
        { from: /Array\.from\(\{length: 25\}/g, to: 'Array.from({length: 10}' },
        { from: /const limit = game === 'EURODREAMS' \? 20 : 25;/g, to: "const limit = game === 'EURODREAMS' ? 10 : 10;" }
    ]);
});

// 2. classifier-train-core.ts, rf-train-core.ts
const neuralPath = path.join(process.cwd(), 'src/services/neural');
['classifier-train-core.ts', 'rf-train-core.ts'].forEach(file => {
    patchFile(path.join(neuralPath, file), [
        { from: /if \(gameName === 'EURODREAMS'\) limit = 20;\s*else limit = 25;/g, to: "if (gameName === 'EURODREAMS') limit = 10;\n                else limit = 10;" }
    ]);
});

// 3. MLClassifierSystem.ts
const mlClassPath = path.join(process.cwd(), 'src/systems/ml/MLClassifierSystem.ts');
if (fs.existsSync(mlClassPath)) {
    patchFile(mlClassPath, [
        { from: /const limit = this.targetField === 'numbers' \? 25 :/g, to: "const limit = this.targetField === 'numbers' ? 10 :" },
        { from: /dynamicMaxVal === 50 \? 25 : \(dynamicMaxVal === 40 \? 20 : 25\)/g, to: "dynamicMaxVal === 50 ? 10 : (dynamicMaxVal === 40 ? 10 : 10)" }
    ]);
}

console.log('Done normalizing to Top 10.');
