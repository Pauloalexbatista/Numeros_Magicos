/**
 * Fix Hardcoded 25 Script
 * 
 * Automatically fixes all systems that have hardcoded 25 to use dynamic counts
 * Run with: npx tsx scripts/fix-hardcoded-25.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const FILES_TO_FIX = [
    'src/services/random-system.ts',
    'src/services/custom/SistCombinadoMedia3.ts',
    'src/services/custom/mdiasemaspontas.ts',
    'src/services/custom/SistMedia3Otimizado.ts',
    'src/services/custom/SistMediaCamadas.ts',
    'src/services/universal-oscillation-v2-system.ts'
];

const GAME_CONFIG_IMPORT = `import { getGameConfig } from './game-config';\n`;
const GAME_CONFIG_IMPORT_CUSTOM = `import { getGameConfig } from '../game-config';\n`;

function fixFile(filePath: string) {
    console.log(`\n📝 Fixing ${path.basename(filePath)}...`);

    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Add import if not present
    const isCustom = filePath.includes('/custom/');
    const importStatement = isCustom ? GAME_CONFIG_IMPORT_CUSTOM : GAME_CONFIG_IMPORT;

    if (!content.includes('getGameConfig')) {
        // Add import after other imports
        const lastImportIndex = content.lastIndexOf('import ');
        const endOfLastImport = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
        modified = true;
        console.log('  ✅ Added getGameConfig import');
    }

    // Add config extraction at start of generateTop10
    if (!content.includes('const { predCount, maxNum } = getGameConfig(')) {
        content = content.replace(
            /(async generateTop10\(.*?\): Promise<number\[\]> \{[\s\S]*?)(if \(.*?\.length === 0\) return)/,
            '$1\n        const { predCount, maxNum } = getGameConfig(history || draws);\n\n        $2'
        );
        modified = true;
        console.log('  ✅ Added game config extraction');
    }

    // Replace hardcoded 25 with predCount
    const replacements = [
        { from: /\.slice\(0,\s*25\)/g, to: '.slice(0, predCount)' },
        { from: /length\s*>=\s*25/g, to: 'length >= predCount' },
        { from: /length\s*<\s*25/g, to: 'length < predCount' },
        { from: /length\s*>\s*25/g, to: 'length > predCount' },
        { from: /i\s*<=\s*50/g, to: 'i <= maxNum' },
    ];

    replacements.forEach(({ from, to }) => {
        const before = content;
        content = content.replace(from, to);
        if (content !== before) {
            modified = true;
            console.log(`  ✅ Replaced ${from.source} with ${to}`);
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  ✅ File updated successfully`);
    } else {
        console.log(`  ℹ️  No changes needed`);
    }
}

function main() {
    console.log('🔧 Fixing hardcoded 25 in all systems...\n');

    const rootDir = process.cwd();

    FILES_TO_FIX.forEach(file => {
        const fullPath = path.join(rootDir, file);
        if (fs.existsSync(fullPath)) {
            try {
                fixFile(fullPath);
            } catch (error) {
                console.error(`  ❌ Error fixing ${file}:`, error instanceof Error ? error.message : 'Unknown error');
            }
        } else {
            console.warn(`  ⚠️  File not found: ${file}`);
        }
    });

    console.log('\n✅ All files processed!\n');
}

main();
