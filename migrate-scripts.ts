import { promises as fs } from 'fs';
import path from 'path';

// Mapeamento de scripts para categorias
const migrations = {
    core: [
        'auto-update.ts',
        'backup-db.ts',
        'turbo-backfill.ts',
        'turbo-medals.ts',
        'turbo-stars.ts',
        'update-ai-cache.ts',
        'turbo-ml.ts'
    ],
    admin: [
        'create-admin.ts',
        'create-admin-hugo.ts',
        'create-test-user.ts',
        'cleanup-admin-cards.ts',
        'cleanup-duplicates.ts',
        'cleanup-ensemble.ts',
        'set-admin-only.ts',
        'set-card-price.ts',
        'lock-premium-cards.ts',
        'register-missing-systems.ts',
        'activate-random-system.ts'
    ],
    database: [
        'seed-cards.ts',
        'seed-history.ts',
        'seed-ranked-systems.ts',
        'seed-ranking-incremental.ts',
        'check-db-stats.ts',
        'delete-draw.ts',
        'reset-ranking.ts',
        'update-db.ts'
    ],
    backfill: [
        'backfill-history.ts',
        'backfill-staging.ts',
        'commit-staging.ts',
        'auto-backfill-loop.ts',
        'backfill-missing-systems.ts',
        'backfill-missing-systems-incremental.ts',
        'backfill-medal-systems.ts',
        'backfill-star-lstm.ts',
        'force-cache-update.ts',
        'regenerate-star-cache.ts'
    ],
    monitoring: [
        'check-cache.ts',
        'check-cards.ts',
        'check-admin-cards.ts',
        'check-latest-draw.ts',
        'check-ranking.ts',
        'check-rankings.ts',
        'check-progress.ts',
        'check-backfill-progress.ts',
        'check-missing-cache.ts',
        'check-medal-status.ts',
        'check-draw-date.ts',
        'check-ranking-data.ts',
        'check-star-averages.ts',
        'check-biggest-winners.ts',
        'check-winner.ts',
        'check-number-house-1.ts',
        'inspect-cache.ts',
        'inspect-state.ts',
        'inspect-state-v2.ts',
        'inspect-detail.ts',
        'inspect-row.ts',
        'show-ranking.ts',
        'show-lstm.ts',
        'debug-ranking-entry.ts',
        'debug-system-stats.ts',
        'get-prediction.ts'
    ],
    analysis: [
        'analyze-ensembles.ts',
        'analyze-yearly-performance.ts',
        'analyze-top6-yearly.ts',
        'analyze-pos1-frequency.ts',
        'analyze-hits-distribution.ts',
        'explain-90-percent.ts',
        'explain-elastic-system.ts',
        'explain-position-mean.ts',
        'show-frequency-stats.ts',
        'show-numbers-per-position.ts',
        'show-position-amplitude.ts',
        'show-elastic-ranges.ts',
        'compare-ensemble.ts',
        'audit-star-ranking.ts'
    ],
    testing: [
        'test-ranking.ts',
        'test-ml-classifier.ts',
        'test-fetch.ts',
        'test-fetch-archive.ts',
        'test-speed.ts',
        'test-ml-speed.ts',
        'test-rf-speed.ts',
        'test-lstm-speed.ts',
        'test-direction-accuracy.ts',
        'verify-all-systems.ts',
        'verify-medal-systems.ts',
        'verify-sequences.ts',
        'verify-vortex.ts',
        'verify-staging.ts',
        'verify-audit.ts',
        'verify-backfill.ts',
        'verify-backfill-actions.ts',
        'verify-anti-hot.ts',
        'verify-complement.ts',
        'verify-login.ts'
    ],
    'ml-training': [
        'background-train.ts',
        'train-exclusion.ts',
        'trigger-exclusion.ts'
    ],
    'ui-management': [
        'reorder-dashboard.ts',
        'add-latest-draw-card.ts',
        'add-lstm-card.ts',
        'add-pyramid-card.ts',
        'add-ranking-card.ts',
        'add-recommended-bet-widget.ts',
        'add-star-lstm-card.ts',
        'add-star-widget.ts',
        'add-mean-reversion-card.ts',
        'remove-mean-reversion-card.ts',
        'list-cards.ts',
        'update-dashboard-layout.ts',
        'update-layout-sizes.ts'
    ],
    experimental: [
        // Testes híbridos
        'test-hybrid-anti-vortex.ts',
        'test-hybrid-mean-centered.ts',
        'test-hybrid-saturation-pressure.ts',
        'test-hybrid-system.ts',
        'test-elastic-markov-hybrid.ts',

        // Testes de mean
        'test-mean3-elastic-proper.ts',
        'test-mean3-pressure-saturation.ts',
        'test-mean3-weighted-score.ts',
        'test-mean3-with-frequency.ts',
        'test-mean-plus-elastic-filter.ts',
        'test-mean-plus-minus-2.ts',
        'test-mean-plus-minus-3.ts',
        'test-mean-reversion.ts',
        'test-mode-vs-mean.ts',

        // Simulações
        'simulate-gold-elastic-v2.ts',
        'simulate-gold-elastic.ts',
        'simulate-hot-layered.ts',
        'simulate-layered-mean3.ts',
        'simulate-media-3-neighbors.ts',
        'simulate-rf-layered.ts',
        'simulate-top5-positions-all-time.ts',
        'simulate-top5-positions.ts',
        'simulate-wide-layered.ts',

        // Análises experimentais
        'analyze-elastic-magnitude.ts',
        'analyze-mean-force.ts',
        'analyze-saturation.ts',
        'backtest-elastic-magnitude.ts',
        'dissect-standard-deviation.ts',
        'find-perfect-exclusion-rule.ts',
        'test-absence-plus-saturation50.ts',
        'test-absence-pressure.ts',
        'test-saturation-theory.ts',
        'test-high-confidence-numbers.ts',
        'test-inverse-prediction.ts',
        'test-exact-stddev-replication.ts',
        'test-top-sizes.ts',

        // Versões antigas
        'update-layout.ts',
        'update-layout-v2.ts',
        'update-layout-v3.ts',
        'reorg-dashboard-v2.ts',
        'reorg-dashboard-v3.ts',
        'debug-cards.ts',
        'debug-cards-full.ts'
    ]
};

async function migrateScripts() {
    const scriptsDir = './src/scripts';
    let moved = 0;
    let skipped = 0;
    let errors = 0;

    console.log('🚀 Iniciando migração de scripts...\n');

    for (const [category, files] of Object.entries(migrations)) {
        const targetDir = path.join(scriptsDir, category);

        console.log(`📁 Categoria: ${category}`);

        for (const file of files) {
            const source = path.join(scriptsDir, file);
            const target = path.join(targetDir, file);

            try {
                // Verificar se o ficheiro existe
                await fs.access(source);

                // Mover ficheiro
                await fs.rename(source, target);
                console.log(`  ✅ ${file}`);
                moved++;
            } catch (error: any) {
                if (error.code === 'ENOENT') {
                    console.log(`  ⚠️  ${file} (não encontrado)`);
                    skipped++;
                } else {
                    console.log(`  ❌ ${file} (erro: ${error.message})`);
                    errors++;
                }
            }
        }
        console.log('');
    }

    console.log('\n📊 Resumo da Migração:');
    console.log(`  ✅ Movidos: ${moved} ficheiros`);
    console.log(`  ⚠️  Ignorados: ${skipped} ficheiros`);
    console.log(`  ❌ Erros: ${errors} ficheiros`);
    console.log('\n✨ Migração concluída!');
}

migrateScripts().catch(console.error);
