const fs = require('fs');

const wheelingFile = 'src/services/wheeling.ts';
let wheelingContent = fs.readFileSync(wheelingFile, 'utf8');

// Remove SATURN and JUPITER, keep MARS and SUN
const patternsCode = `
export const MARS_PATTERN = [
    [11, 24, 7, 20, 3],
    [4, 12, 25, 8, 16],
    [17, 5, 13, 21, 9],
    [10, 18, 1, 14, 22],
    [23, 6, 19, 2, 15]
];
export const MARS_ORDER = [13, 3, 8, 11, 12, 14, 15, 18, 23, 1, 2, 4, 5, 6, 7, 9, 10, 16, 17, 19, 20, 21, 22, 24, 25];

export const SUN_PATTERN = [
    [6, 32, 3, 34, 35, 1],
    [7, 11, 27, 28, 8, 30],
    [19, 14, 16, 15, 23, 24],
    [18, 20, 22, 21, 17, 13],
    [25, 29, 10, 9, 26, 12],
    [36, 5, 33, 4, 2, 31]
];
export const SUN_ORDER = [1, 6, 8, 11, 15, 16, 21, 22, 26, 29, 31, 36, 2, 3, 4, 5, 7, 9, 10, 12, 13, 14, 17, 18, 19, 20, 23, 24, 25, 27, 28, 30, 32, 33, 34, 35];

export function getMagicSquareData(size) {
    if (size === 25) return { pattern: MARS_PATTERN, order: MARS_ORDER, name: 'Marte', sum: 65 };
    if (size === 36) return { pattern: SUN_PATTERN, order: SUN_ORDER, name: 'Sol', sum: 111 };
    return null;
}
`;

// Replace the previous big block
wheelingContent = wheelingContent.replace(/export const SATURN_PATTERN[\s\S]*?return null;\n\}\n/m, patternsCode);
fs.writeFileSync(wheelingFile, wheelingContent, 'utf8');

const pageFile = 'src/app/wheeling/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');
pageContent = pageContent.replace(/\[9, 16, 25, 36\]/g, '[25, 36]');
pageContent = pageContent.replace(/9, 16, 25 ou 36/g, '25 ou 36');
pageContent = pageContent.replace(/9, 16, 25, 36/g, '25 ou 36');
pageContent = pageContent.replace(/9, 16, 25 ou 36/g, '25 ou 36'); // just in case
pageContent = pageContent.replace(/\(9, 16, 25 ou 36\)/g, '(25 ou 36)');
fs.writeFileSync(pageFile, pageContent, 'utf8');

const displayFile = 'src/components/MagicSquareDisplay.tsx';
let displayContent = fs.readFileSync(displayFile, 'utf8');
displayContent = displayContent.replace(/<GridHeader title="[^"]+" subtitle="[^"]+" \/>[\s\S]*?<SquareGrid data=\{MARS_PATTERN\} isPattern showSums \/>/g, `<GridHeader title={\`QUADRADO MÁGICO DE \${name.toUpperCase()}\`} subtitle="Posições Estáticas do Padrão" />\n                    <SquareGrid data={pattern} isPattern showSums />`);
fs.writeFileSync(displayFile, displayContent, 'utf8');

console.log("Cleanup done");
