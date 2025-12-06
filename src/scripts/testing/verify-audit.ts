import { runSystemDiagnostics } from '../../app/admin/audit/actions';

async function main() {
    console.log('🚀 Starting System Diagnostics Verification...');

    try {
        const results = await runSystemDiagnostics();

        console.log('\n📊 Results:');
        console.table(results.map(r => ({
            System: r.systemName,
            Status: r.status,
            Time: `${r.executionTimeMs}ms`,
            Count: r.predictionCount,
            Notes: r.notes.join(', ')
        })));

        const errors = results.filter(r => r.status === 'ERROR');
        if (errors.length > 0) {
            console.error(`\n❌ Found ${errors.length} errors!`);
            process.exit(1);
        } else {
            console.log('\n✅ All systems passed diagnostics!');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

main();
