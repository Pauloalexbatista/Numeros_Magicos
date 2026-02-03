



async function verifyPage(url: string, keyword: string) {
    try {
        console.log(`Checking ${url}...`);
        const res = await fetch(url);

        if (res.status !== 200) {
            console.error(`❌ ${url} returned status ${res.status}`);
            return false;
        }

        const html = await res.text();
        if (html.includes(keyword)) {
            console.log(`✅ ${url} contains "${keyword}"`);
            return true;
        } else {
            console.error(`❌ ${url} does NOT contain "${keyword}"`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error fetching ${url}:`, error);
        return false;
    }
}

async function main() {
    console.log('--- Verifying Frontend Routes ---');

    // Give server a moment if it just started
    await new Promise(r => setTimeout(r, 2000));

    const results = await Promise.all([
        verifyPage('http://localhost:3000/totoloto', 'Totoloto'),
        verifyPage('http://localhost:3000/eurodreams', 'EuroDreams'),
        verifyPage('http://localhost:3000/', 'Euromilhões') // Assuming main page has this title or similar
    ]);

    if (results.every(r => r)) {
        console.log('🎉 All routes verified successfully!');
        process.exit(0);
    } else {
        console.error('⚠️ Some routes failed verification.');
        process.exit(1);
    }
}

main();
