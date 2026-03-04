import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];
    let md = `# Sistema de Previsões - Documentação Completa\n\n> **Total de Sistemas Ativos:** [COUNT]\n> **Última Atualização:** ${new Date().toISOString().split('T')[0]}\n\n---\n\n`;
    let count = 0;

    for (const game of games) {
        md += `## ${game}\n\n`;

        const nums = await prisma.rankedSystem.findMany({
            where: { game, domain: 'NUMBERS' },
            orderBy: { name: 'asc' }
        });

        md += `### Sistemas de Números\n\n| Sistema | Descrição | Status |\n|---------|-----------|--------|\n`;
        nums.forEach(n => {
            md += `| ${n.name} | ${n.description || 'Previsão de Números.'} | ${n.isActive ? '✅ Ativo' : '❌ Inativo'} |\n`;
            if (n.isActive) count++;
        });

        const stars = await prisma.rankedSystem.findMany({
            where: { game, domain: 'STARS' },
            orderBy: { name: 'asc' }
        });

        md += `\n### Sistemas de Estrelas/Sonho\n\n| Sistema | Descrição | Status |\n|---------|-----------|--------|\n`;
        stars.forEach(s => {
            md += `| ${s.name} | ${s.description || 'Previsão de Estrelas.'} | ${s.isActive ? '✅ Ativo' : '❌ Inativo'} |\n`;
            if (s.isActive) count++;
        });

        md += `\n---\n\n`;
    }

    md = md.replace('[COUNT]', count.toString());
    const fp = path.join(__dirname, '..', 'docs', 'SISTEMAS_DOCUMENTACAO.md');
    fs.writeFileSync(fp, md, 'utf-8');
    console.log(`Documentação gerada com sucesso (${count} sistemas)! Salva em ${fp}`);
}

main().finally(() => prisma.$disconnect());
