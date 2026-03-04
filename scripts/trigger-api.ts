const url = 'https://www.numerosmagicos.com/api/admin/backfill';
const secret = 'f63c1f2b2c3d4e5f6a7b8c9d0e1f2a3b';

async function trigger() {
    console.log('--- TRIGGERING SERVER-SIDE BACKFILL ---');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, limit: 4000 })
        });

        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

trigger();
