import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

async function fixImports() {
    const scriptsDir = './src/scripts';

    // Encontrar todos os ficheiros .ts nas subpastas
    const files = await glob(`${scriptsDir}/**/*.ts`, {
        ignore: ['**/node_modules/**']
    });

    let fixed = 0;

    for (const file of files) {
        try {
            let content = await fs.readFile(file, 'utf-8');
            const originalContent = content;

            // Substituir ../services por ../../services (para ficheiros em subpastas)
            // Mas não para ficheiros na raiz de scripts
            const relativePath = path.relative(scriptsDir, file);
            const depth = relativePath.split(path.sep).length - 1;

            if (depth > 0) {
                // Ficheiro está numa subpasta
                content = content.replace(/from ['"]\.\.\/services/g, `from '../../services`);
                content = content.replace(/from ['"]\.\.\/lib/g, `from '../../lib`);
                content = content.replace(/from ['"]\.\.\/utils/g, `from '../../utils`);
                content = content.replace(/from ['"]\.\.\/models/g, `from '../../models`);
            }

            if (content !== originalContent) {
                await fs.writeFile(file, content, 'utf-8');
                console.log(`✅ Fixed: ${file}`);
                fixed++;
            }
        } catch (error) {
            console.error(`❌ Error fixing ${file}:`, error);
        }
    }

    console.log(`\n✨ Fixed ${fixed} files`);
}

fixImports().catch(console.error);
