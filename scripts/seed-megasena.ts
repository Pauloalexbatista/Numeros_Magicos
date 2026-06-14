import { PrismaClient } from '@prisma/client';
import https from 'https';
import { GameType } from '../src/types/game';

const prisma = new PrismaClient();

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function seedMegaSena() {
    console.log('Fetching all MegaSena draws from API...');
    try {
        const agent = new https.Agent({ rejectUnauthorized: false });
        const response = await fetch('https://loteriascaixa-api.herokuapp.com/api/megasena', {
            // @ts-ignore
            agent
        });
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status} ${response.statusText}`);
        }
        
        const draws = await response.json();
        console.log(`Found ${draws.length} draws from API.`);
        
        let imported = 0;
        let skipped = 0;
        
        // Batch size for processing to not overwhelm DB
        const batchSize = 100;
        
        for (let i = 0; i < draws.length; i += batchSize) {
            const batch = draws.slice(i, i + batchSize);
            const operations = [];
            
            for (const draw of batch) {
                // Parse date "DD/MM/YYYY" to ISO
                const dateParts = draw.data.split('/');
                if (dateParts.length !== 3) {
                    console.log(`Invalid date format for draw ${draw.concurso}: ${draw.data}`);
                    continue;
                }
                
                const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                const drawDate = new Date(isoDate + "T12:00:00Z");
                const startOfDay = new Date(isoDate + "T00:00:00Z");
                const endOfDay = new Date(isoDate + "T23:59:59Z");
                
                const numbers = draw.dezenas.map((n: string) => parseInt(n)).sort((a: number, b: number) => a - b);
                const numbersDrawOrder = draw.dezenas.map((n: string) => parseInt(n));
                
                // Parse jackpot
                let jackpot = 0;
                if (draw.acumuladaProxConcurso) {
                    const cleanStr = draw.acumuladaProxConcurso.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
                    jackpot = parseFloat(cleanStr) || 0;
                }
                
                const hasWinner = !draw.acumulou;
                
                // Add to upsert operations (use findFirst and create if not exists inside a loop, since UPSERT requires unique constraint which might not be set exactly for game+date)
                operations.push(async () => {
                    const existing = await prisma.draw.findFirst({
                        where: {
                            game: 'MEGASENA',
                            date: { gte: startOfDay, lte: endOfDay }
                        }
                    });
                    
                    if (!existing) {
                        await prisma.draw.create({
                            data: {
                                game: 'MEGASENA',
                                date: drawDate,
                                numbers: JSON.stringify(numbers),
                                stars: JSON.stringify([]),
                                numbersDrawOrder: JSON.stringify(numbersDrawOrder),
                                starsDrawOrder: JSON.stringify([]),
                                jackpot,
                                hasWinner
                            }
                        });
                        imported++;
                    } else {
                        skipped++;
                    }
                });
            }
            
            // Execute batch serially to avoid connection pool exhaustion
            for (const op of operations) {
                await op();
            }
            
            console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(draws.length/batchSize)}... (Imported: ${imported}, Skipped: ${skipped})`);
        }
        
        console.log(`\n?? Seed completed! Imported ${imported} new draws, skipped ${skipped} existing draws.`);
        
    } catch (error) {
        console.error('Error during seed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedMegaSena();
