async function inspectArchiveRow() {
    try {
        const response = await fetch('https://www.euro-millions.com/results-archive-2024', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const text = await response.text();

        // Find the first result row
        const rowStart = text.indexOf('<tr class="resultRow"');
        if (rowStart !== -1) {
            const rowEnd = text.indexOf('</tr>', rowStart);
            console.log('--- ROW HTML ---');
            console.log(text.substring(rowStart, rowEnd + 5));
        } else {
            console.log('Row not found');
        }

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

inspectArchiveRow();
