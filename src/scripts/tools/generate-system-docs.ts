import { prisma } from '@/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

async function generateSystemDocumentation() {
    console.log('📚 Generating System Documentation...\n');

    const systems = await prisma.rankedSystem.findMany({
        orderBy: [
            { game: 'asc' },
            { name: 'asc' }
        ]
    });

    // Group by game
    const byGame: Record<string, typeof systems> = {
        'EUROMILLIONS': [],
        'TOTOLOTO': [],
        'EURODREAMS': []
    };

    systems.forEach(s => {
        if (byGame[s.game]) {
            byGame[s.game].push(s);
        }
    });

    // Generate markdown
    let markdown = '# Sistema de Previsões - Documentação Completa\n\n';
    markdown += `> **Total de Sistemas:** ${systems.length}\n`;
    markdown += `> **Última Atualização:** ${new Date().toISOString().split('T')[0]}\n\n`;
    markdown += '---\n\n';

    for (const [game, gameSystems] of Object.entries(byGame)) {
        if (gameSystems.length === 0) continue;

        markdown += `## ${game}\n\n`;
        markdown += `**Total:** ${gameSystems.length} sistemas\n\n`;

        // Categorize systems
        const categories: Record<string, typeof gameSystems> = {
            'Sistemas Base (Frequência)': [],
            'Sistemas Base (Padrões)': [],
            'Sistemas Base (Estatística)': [],
            'Sistemas Anti': [],
            'Sistemas Ensemble': [],
            'Sistemas Medal': [],
            'Sistemas de Estrelas': []
        };

        gameSystems.forEach(s => {
            if (s.name.includes('Anti-')) {
                categories['Sistemas Anti'].push(s);
            } else if (s.name.includes('Medal')) {
                categories['Sistemas Medal'].push(s);
            } else if (s.name.includes('Ensemble')) {
                categories['Sistemas Ensemble'].push(s);
            } else if (s.name.includes('Star') || s.name.includes('Estrela')) {
                categories['Sistemas de Estrelas'].push(s);
            } else if (s.name.includes('Hot') || s.name.includes('Cold') || s.name.includes('Frequency')) {
                categories['Sistemas Base (Frequência)'].push(s);
            } else if (s.name.includes('Pattern') || s.name.includes('Cluster') || s.name.includes('Pyramid') || s.name.includes('Vortex')) {
                categories['Sistemas Base (Padrões)'].push(s);
            } else {
                categories['Sistemas Base (Estatística)'].push(s);
            }
        });

        for (const [category, categorySystems] of Object.entries(categories)) {
            if (categorySystems.length === 0) continue;

            markdown += `### ${category}\n\n`;
            markdown += `| Sistema | Descrição | Status |\n`;
            markdown += `|---------|-----------|--------|\n`;

            categorySystems.forEach(s => {
                const status = s.isActive ? '✅ Ativo' : '❌ Inativo';
                const desc = s.description || 'Sem descrição';
                markdown += `| ${s.name} | ${desc} | ${status} |\n`;
            });

            markdown += '\n';
        }

        markdown += '---\n\n';
    }

    // Save to file
    const outputPath = path.join(process.cwd(), 'docs', 'SISTEMAS_DOCUMENTACAO.md');
    fs.writeFileSync(outputPath, markdown, 'utf-8');

    console.log(`✅ Documentation generated: ${outputPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   EuroMillions: ${byGame['EUROMILLIONS'].length} sistemas`);
    console.log(`   Totoloto: ${byGame['TOTOLOTO'].length} sistemas`);
    console.log(`   EuroDreams: ${byGame['EURODREAMS'].length} sistemas`);

    await prisma.$disconnect();
}

generateSystemDocumentation();
