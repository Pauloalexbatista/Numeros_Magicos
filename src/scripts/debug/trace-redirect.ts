
import https from 'https';

async function main() {
    const url = 'https://www.jogossantacasa.pt/web/SCCartazResult/totoloto';
    const agent = new https.Agent({ rejectUnauthorized: false });
    try {
        const response = await fetch(url, {
            agent: agent as any,
            redirect: 'manual', // Don't follow automatically
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Location: ${response.headers.get('location')}`);

        if (response.status === 302 || response.status === 301) {
            const newUrl = response.headers.get('location');
            if (newUrl) {
                console.log(`Following redirect to ${newUrl}...`);
                const response2 = await fetch(newUrl.startsWith('http') ? newUrl : `https://www.jogossantacasa.pt${newUrl}`, {
                    agent: agent as any,
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });
                console.log(`Final Status: ${response2.status}`);
                const text = await response2.text();
                console.log(text.slice(0, 500));
            }
        }
    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

main();
