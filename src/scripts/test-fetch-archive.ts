async function testFetchArchive() {
    try {
        console.log('Fetching archive...');
        const response = await fetch('https://www.euro-millions.com/results-archive-2024', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Content length:', text.length);

        // Check for table rows or specific data structure
        const tableIndex = text.indexOf('<table');
        if (tableIndex !== -1) {
            console.log('--- FOUND TABLE ---');
            console.log(text.substring(tableIndex, tableIndex + 500));
        } else {
            console.log('Table not found');
        }

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

testFetchArchive();
