import fs from 'fs';
import path from 'path';

const SYSTEMS_DIR = path.join(process.cwd(), 'src', 'services', 'custom');
const RANKED_SYSTEMS_PATH = path.join(process.cwd(), 'src', 'services', 'ranked-systems.ts');

export async function scaffoldNewSystem(systemName: string) {
    // 1. Sanitize Name
    const safeName = systemName.replace(/[^a-zA-Z0-9]/g, '');
    const className = `${safeName}System`;
    const fileName = `${safeName}.ts`;
    const filePath = path.join(SYSTEMS_DIR, fileName);

    // 2. Create Directory if not exists
    if (!fs.existsSync(SYSTEMS_DIR)) {
        fs.mkdirSync(SYSTEMS_DIR, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
        throw new Error(`System file ${fileName} already exists.`);
    }

    // 3. Create File Content
    const fileContent = `import { Draw } from '@prisma/client';
import { IPredictiveSystem } from '../ranked-systems';

export class ${className} implements IPredictiveSystem {
    name = "${systemName}";
    description = "Sistema costumizado criado via Admin UI";

    async generateTop10(draws: Draw[]): Promise<number[]> {
        // TODO: Implement logic here
        // Example: Return numbers 1 to 25
        return Array.from({ length: 25 }, (_, i) => i + 1);
    }
}
`;

    fs.writeFileSync(filePath, fileContent);

    // 4. Register in ranked-systems.ts
    let rankedSystemsContent = fs.readFileSync(RANKED_SYSTEMS_PATH, 'utf-8');

    // Add Import
    const importStatement = `import { ${className} } from './custom/${safeName}';\n`;
    rankedSystemsContent = importStatement + rankedSystemsContent;

    // Add to Array
    const marker = '// __DYNAMIC_SYSTEMS_MARKER__';
    if (!rankedSystemsContent.includes(marker)) {
        throw new Error('Marker not found in ranked-systems.ts');
    }

    const instantiation = `    new ${className}(),\n    ${marker}`;
    rankedSystemsContent = rankedSystemsContent.replace(marker, instantiation);

    fs.writeFileSync(RANKED_SYSTEMS_PATH, rankedSystemsContent);

    return { success: true, className, fileName };
}
