import { prisma } from './src/lib/prisma';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

const KEYWORD_MONTHS: { [key: string]: string } = {
    'jan.': '01', 'fev.': '02', 'mar.': '03', 'abr.': '04', 'mai.': '05', 'jun.': '06',
    'jul.': '07', 'ago.': '08', 'set.': '09', 'out.': '10', 'nov.': '11', 'dez.': '12'
};

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapePage(page: number): Promise<number> {
    const url = `https://loteriaguru.com/portugal-resultados-loteria/pt-totoloto/pt-totoloto-historico-de-resultados?page=${page}`;
    
    return new Promise((resolve) => {
        https.get(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', async () => {
                const blocks = body.split('lg-line').slice(1);
                if (blocks.length === 0) {
                    return resolve(0);
                }
                
                let newlyInsertedCount = 0;
                
                for (const block of blocks) {
                    const dateMatch = block.match(/(\d{1,2})\s+([a-zç\.]+)\s*<\/strong>\s*(\d{4})/i);
                    if (!dateMatch) continue;
                    
                    const day = dateMatch[1].padStart(2, '0');
                    const monthStr = dateMatch[2].toLowerCase();
                    const year = parseInt(dateMatch[3]);
                    const month = KEYWORD_MONTHS[monthStr];
                    if (!month) continue;
                    
                    if (year < 2011) {
                        return resolve(-1); // Signal to stop completely
                    }
                    
                    const isoDate = `${year}-${month}-${day}`;
                    const drawDate = new Date(isoDate + "T12:00:00Z");
                    
                    const dayOfWeek = drawDate.getUTCDay();
                    if (dayOfWeek === 2) { 
                        drawDate.setUTCDate(drawDate.getUTCDate() + 1);
                    } else if (dayOfWeek === 5) { 
                        drawDate.setUTCDate(drawDate.getUTCDate() + 1);
                    } else if (dayOfWeek === 0 && drawDate > new Date("2011-03-01T00:00:00Z")) { 
                        drawDate.setUTCDate(drawDate.getUTCDate() - 1);
                    }
                    
                    const blockNumbersPart = block.split('lg-numbers-small')[1]?.split('</ul>')[0];
                    if (!blockNumbersPart) continue;
                    const numberMatches = [...blockNumbersPart.matchAll(/class="lg-number[^"]*">(\d+)</g)];
                    let allNumbers = numberMatches.map(m => parseInt(m[1]));
                    if (allNumbers.length < 6) continue;
                    
                    const luckyNumber = allNumbers.pop();
                    const mainNumbers = allNumbers.sort((a, b) => a - b);
                    const stars = [luckyNumber!];
                    
                    const existing = await prisma.draw.findFirst({
                        where: { game: 'TOTOLOTO', date: drawDate }
                    });
                    
                    if (!existing) {
                        await prisma.draw.create({
                            data: {
                                game: 'TOTOLOTO',
                                date: drawDate,
                                numbers: JSON.stringify(mainNumbers),
                                stars: JSON.stringify(stars),
                                numbersDrawOrder: JSON.stringify(mainNumbers),
                                starsDrawOrder: JSON.stringify(stars),
                                jackpot: 0,
                                hasWinner: false
                            }
                        });
                        newlyInsertedCount++;
                    }
                }
                resolve(newlyInsertedCount);
            });
        }).on('error', () => {
            resolve(0);
        });
    });
}

async function main() {
    console.log('🚀 Iniciando restauro forçado das páginas omitidas do Totoloto...');
    let totalInserted = 0;
    
    for (let page = 45; page <= 250; page++) {
        console.log(`A extrair página ${page}...`);
        const inserted = await scrapePage(page);
        
        if (inserted === -1) {
            console.log(' Alcançou o limite de ano (2011). Fim.');
            break;
        }
        
        if (inserted === 0) {
            console.log(` Página ${page} vazia ou erro. Tentando próxima...`);
        } else {
            console.log(` ✅ Recuperados ${inserted} sorteios da página ${page}!`);
            totalInserted += inserted;
        }
        
        // Anti-rate-limit delay
        await delay(1000);
    }
    
    console.log(`\n🎉 Restauro concluído! Total de sorteios salvos: ${totalInserted}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
