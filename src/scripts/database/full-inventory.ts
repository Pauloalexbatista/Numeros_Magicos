/**
 * Levantamento exaustivo de TODAS as tabelas e volumes de dados na base de dados de produção.
 * 
 * Executar: npx tsx src/scripts/database/full-inventory.ts
 */

import { prisma } from '../../lib/prisma';

async function fullInventory() {
    console.log('# 📋 INVENTÁRIO COMPLETO DA BASE DE DADOS (VPS)\n');
    console.log(`Data: ${new Date().toISOString()}\n`);

    const tables = [
        'Draw', 'RankedSystem', 'SystemPerformance', 'StarSystemPerformance', 
        'SystemPerformanceStaging', 'SystemRanking', 'StarSystemRanking', 
        'CachedPrediction', 'MLModelTraining', 'SystemPrediction', 
        'User', 'Account', 'Session', 'VerificationToken'
    ];

    console.log('| Tabela | Registos | Descrição |');
    console.log('| :--- | :--- | :--- |');

    for (const table of tables) {
        try {
            const count = await (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)].count();
            let description = '';
            
            switch(table) {
                case 'Draw': description = 'Histórico total de sorteios'; break;
                case 'RankedSystem': description = 'Sistemas registados (Ativos/Inativos)'; break;
                case 'SystemPerformance': description = 'Resultados históricos de números'; break;
                case 'StarSystemPerformance': description = 'Resultados históricos de estrelas'; break;
                case 'SystemPerformanceStaging': description = 'Resultados em fase de teste'; break;
                case 'CachedPrediction': description = 'Previsões para o próximo sorteio'; break;
                case 'MLModelTraining': description = 'Estado e pesos dos modelos de IA'; break;
                default: description = '-';
            }

            console.log(`| ${table} | ${count.toLocaleString()} | ${description} |`);
        } catch (e) {
            console.log(`| ${table} | ❌ Erro | - |`);
        }
    }

    console.log('\n## 🧠 Análise de Sistemas Neurais (Performance)');
    const neuralSystems = await prisma.systemPerformance.groupBy({
        by: ['systemName', 'game'],
        _count: { systemName: true },
        _min: { createdAt: true },
        _max: { createdAt: true }
    });

    console.log('\n| Sistema | Jogo | Sorteios | Desde | Até |');
    console.log('| :--- | :--- | :--- | :--- | :--- |');
    
    neuralSystems.forEach(s => {
        if (s.systemName.includes('LSTM') || s.systemName.includes('Random Forest') || s.systemName.includes('Classifier')) {
            console.log(`| ${s.systemName} | ${s.game} | ${s._count.systemName} | ${s._min.createdAt?.toISOString().split('T')[0]} | ${s._max.createdAt?.toISOString().split('T')[0]} |`);
        }
    });

    console.log('\n## 🧠 Análise de Estrelas (Neural)');
    const starNeural = await prisma.starSystemPerformance.groupBy({
        by: ['systemName', 'game'],
        _count: { systemName: true }
    });
    
    starNeural.forEach(s => {
        if (s.systemName.includes('LSTM') || s.systemName.includes('Random Forest')) {
            console.log(`- **${s.systemName}** (${s.game}): ${s._count.systemName} sorteios`);
        }
    });

    await prisma.$disconnect();
}

fullInventory().catch(console.error);
