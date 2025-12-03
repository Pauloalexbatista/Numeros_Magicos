async function testFetch() {
    try {
        const response = await fetch('https://www.jogossantacasa.pt/web/SCCartazResult/euroMilhoes');
        const text = await response.text();
        console.log('Total length:', text.length);

        const searchTerms = ['ORDEM DE SAÍDA', 'Sorteio:', 'DATA DO SORTEIO'];

        for (const term of searchTerms) {
            const index = text.indexOf(term);
            if (index !== -1) {
                console.log(`--- FOUND "${term}" ---`);
                console.log(text.substring(index - 100, index + 500));
            } else {
                console.log(`"${term}" not found`);
            }
        }

        // Also look for the numbers directly if possible (e.g. list items)
        // But let's see the structure first.

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

testFetch();
