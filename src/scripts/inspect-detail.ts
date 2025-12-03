async function inspectDetailPage() {
    try {
        // Fetch a specific draw detail page
        const response = await fetch('https://www.euro-millions.com/results/31-12-2024', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const text = await response.text();

        console.log('Page length:', text.length);

        // Search for keywords indicating draw order
        const keywords = ['Draw Order', 'Ball Order', 'Order of Draw', 'Ordem'];
        let found = false;
        for (const kw of keywords) {
            const index = text.indexOf(kw);
            if (index !== -1) {
                console.log(`--- FOUND "${kw}" ---`);
                console.log(text.substring(index - 100, index + 500));
                found = true;
            }
        }

        if (!found) {
            console.log('No explicit "Draw Order" keywords found.');
            // Dump a snippet of the main numbers area to see if there's a hidden structure
            const ballIndex = text.indexOf('class="ball"');
            if (ballIndex !== -1) {
                console.log('--- BALLS AREA ---');
                console.log(text.substring(ballIndex - 200, ballIndex + 1000));
            }
        }

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

inspectDetailPage();
