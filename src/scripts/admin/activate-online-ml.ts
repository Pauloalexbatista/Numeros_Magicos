process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'https://numerosmagicos.com/api/admin';
const SECRET = '?secret=magia2026';

async function checkStatus() {
    console.log('🚀 Checking Neural Networks Status on VPS...');
    const statusRes = await fetch(`${BASE_URL}/neural-status${SECRET}`);
    const statusData = await statusRes.json();
    
    if (statusData.success) {
        console.log('--- STATUS SUMMARY ---');
        Object.keys(statusData.status).forEach(game => {
            console.log(`\n🎲 ${game}:`);
            const models = statusData.status[game];
            Object.keys(models).forEach(modelKey => {
                const info = models[modelKey];
                const readiness = info.trained ? `✅ TRAINED (Accuracy: ${info.accuracy}%)` : '❌ NOT TRAINED';
                console.log(`  - [${info.name}] -> ${readiness}`);
            });
        });
    }

    console.log('\n\n📡 Fetching ALL Systems to see which ones are ready for activation...');
    const sysRes = await fetch(`${BASE_URL}/systems${SECRET}`);
    const sysData = await sysRes.json();
    
    if (!sysData.systems) {
         console.log('Failed to fetch systems!', sysData);
         return;
    }

    const systemsToActivate = sysData.systems.filter((s: any) => 
        (s.name.includes('LSTM') || s.name.includes('Random Forest') || s.name.includes('ML Classifier') || s.systemType === 'NEURAL' || s.name.includes('Exclusão')) &&
        s.isActive === false
    );

    console.log(`\nFound ${systemsToActivate.length} inactive Neural/ML systems that need activation:`);
    systemsToActivate.forEach((sys: any) => {
        console.log(`  - ${sys.name} (${sys.game})`);
    });
}

checkStatus().catch(console.error);
