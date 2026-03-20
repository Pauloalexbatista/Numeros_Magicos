import { prisma } from './src/lib/prisma';
import * as xlsx from 'xlsx';

async function run() {
    const systems = await prisma.rankedSystem.findMany({
        orderBy: [
            { game: 'asc' },
            { domain: 'asc' },
            { name: 'asc' }
        ]
    });

    console.log(`Found ${systems.length} systems in database.`);
    
    const missingLSTM = [];
    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];
    
    for (const game of games) {
        const gameSystems = systems.filter(s => s.game === game);
        const hasLSTM = gameSystems.some(s => s.name.includes('LSTM'));
        if (!hasLSTM) {
            missingLSTM.push(game);
        }
        console.log(`- ${game}: ${gameSystems.length} systems. Has LSTM? ${hasLSTM}`);
    }

    // Generate Excel
    const worksheet = xlsx.utils.json_to_sheet(systems.map(s => ({
        Game: s.game,
        Domain: s.domain,
        Type: s.systemType,
        Name: s.name,
        Description: s.description,
        IsActive: s.isActive,
        Complexity: s.complexity,
        Status: s.isActive ? 'Ativo' : 'Pausado'
    })));

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sistemas_Registados');
    
    xlsx.writeFile(workbook, 'Sistemas_Registados.xlsx');
    console.log('✅ Exported to Sistemas_Registados.xlsx');
}

run().catch(console.error).finally(() => prisma.$disconnect());
