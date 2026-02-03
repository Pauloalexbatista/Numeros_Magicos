
import https from 'https';
import fs from 'fs';
import path from 'path';

async function fetchUrl(url: string) {
    console.log(`Fetching ${url}...`);
    const agent = new https.Agent({ rejectUnauthorized: false });
    try {
        const response = await fetch(url, {
            agent: agent as any,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const text = await response.text();
        const filePath = path.join(__dirname, 'totoloto-dump.html');
        fs.writeFileSync(filePath, text);
        console.log(`Saved ${text.length} bytes to ${filePath}`);

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

async function main() {
    await fetchUrl('https://loteriaguru.com/portugal-resultados-loteria/pt-totoloto/pt-totoloto-historico-de-resultados');
}

main();
