import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

function fetchPage(page: number) {
    const url = `https://loteriaguru.com/portugal-resultados-loteria/pt-totoloto/pt-totoloto-historico-de-resultados?page=${page}`;
    https.get(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
            const blocks = body.split('lg-line').slice(1);
            console.log(`Page ${page}: ${blocks.length} blocks found`);
            for (let i = 0; i < Math.min(5, blocks.length); i++) {
                const b = blocks[i];
                const dateMatch = b.match(/(\d{1,2})\s+([a-zç\.]+)\s*<\/strong>\s*(\d{4})/i);
                
                const blockNumbersPart = b.split('lg-numbers-small')[1]?.split('</ul>')[0];
                const numM = [...(blockNumbersPart || '').matchAll(/class="lg-number[^"]*">(\d+)</g)].map(m => m[1]);
                
                if (dateMatch) {
                    console.log(`[Extracted] Date: ${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]} | Numbers: ${numM.join(',')}`);
                }
            }
        });
    });
}

// 2011 is likely around page 600-700
fetchPage(600);
fetchPage(620);
fetchPage(640);
