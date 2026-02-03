
import https from 'https';

async function main() {
    const url = 'https://www.jogossantacasa.pt/';
    console.log(`Scanning ${url} for Totoloto links...`);
    const agent = new https.Agent({ rejectUnauthorized: false });
    try {
        const response = await fetch(url, {
            agent: agent as any,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        const text = await response.text();

        // Find all hrefs with 'totoloto' (case insensitive)
        const regex = /href="([^"]*totoloto[^"]*)"/gi;
        let match;
        const links = new Set<string>();

        while ((match = regex.exec(text)) !== null) {
            links.add(match[1]);
        }

        console.log("Found links:");
        links.forEach(l => console.log(l));

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

main();
