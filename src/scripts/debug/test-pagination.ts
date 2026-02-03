
import https from 'https';

async function main() {
    // Try page 2
    const url = 'https://loteriaguru.com/portugal-resultados-loteria/pt-totoloto/pt-totoloto-historico-de-resultados?page=2';
    console.log(`Fetching ${url}...`);
    const agent = new https.Agent({ rejectUnauthorized: false });
    try {
        const response = await fetch(url, {
            agent: agent as any,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        const text = await response.text();
        // Check if we see different dates than page 1 (Page 1 had 31 Jan 2026)
        // If we see older dates, then query param works.
        console.log(text.slice(0, 1000));

        const dateMatch = text.match(/<div class="column is-6 lg-date has-text-right">\s*<strong>\s*(\d{2})\s+([a-zç\.]+)\.\s*<\/strong>\s*(\d{4})/i);
        if (dateMatch) {
            console.log(`Found date on page 2: ${dateMatch[0]}`);
        } else {
            console.log("No date found in snippet.");
        }

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

main();
