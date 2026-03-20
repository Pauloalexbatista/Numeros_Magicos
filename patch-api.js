const fs = require('fs');
let code = fs.readFileSync('src/app/api/admin/neural-status/route.ts', 'utf8');

const helperStr = `
        const getModelMeta = (model: any) => {
            if (!model || !model.modelData) return { accuracy: null, nextPrediction: null };
            try {
                const parsed = JSON.parse(model.modelData);
                return { accuracy: parsed.accuracy || null, nextPrediction: parsed.nextPrediction || null };
            } catch {
                return { accuracy: null, nextPrediction: null };
            }
        };
`;

if (!code.includes('getModelMeta')) {
    code = code.replace('const getDaysSince = (date: Date | null | undefined) => {', helperStr + '\n        const getDaysSince = (date: Date | null | undefined) => {');
}

// Regex to capture the variable name before ?.lastTrained || null,
// Example matching: 
// lastTrained: lstmStars?.lastTrained || null,
// daysSinceTraining: getDaysSince(lstmStars?.lastTrained)
const regex = /daysSinceTraining:\s*getDaysSince\(([a-zA-Z0-9_]+)\?\.lastTrained\)/g;

code = code.replace(regex, (match, varName) => {
    return match + `,\n                    ...getModelMeta(${varName})`;
});

fs.writeFileSync('src/app/api/admin/neural-status/route.ts', code);
console.log('API Route patched! New length:', code.length);
