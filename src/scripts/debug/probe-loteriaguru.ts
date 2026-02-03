
import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

async function checkPage(page: number) {
    const url = `https://loteriaguru.com/portugal-resultados-loteria/pt-totoloto/pt-totoloto-historico-de-resultados?page=${page}`;
    try {
        const response = await fetch(url, { agent });
        const text = await response.text();

        // Regex as used in TotolotoService
        // text.split('lg-line')
        const blocks = text.split('lg-line').slice(1);

        console.log(`Page ${page}: Status ${response.status}, Blocks Found: ${blocks.length}`);

        if (blocks.length > 0) {
            const dateMatch = blocks[0].match(/(\d{1,2})\s+([a-zç\.]+)\s*<\/strong>\s*(\d{4})/i);
            if (dateMatch) {
                console.log(`   First Date: ${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}`);
            } else {
                console.log('   (Date parse failed on first block)');
            }
        }
    } catch (error) {
        console.error(`Page ${page} Failed: ${error.message}`);
    }
}

async function run() {
    console.log('🕵️ Probing LoteriaGuru Pagination (Pages 50-60)...');
    for (let i = 50; i <= 60; i++) {
        await checkPage(i);
        await new Promise(r => setTimeout(r, 500)); // Polite delay
    }
}

run();
