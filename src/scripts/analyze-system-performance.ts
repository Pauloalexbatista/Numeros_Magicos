import { prisma } from '../lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

interface SystemReport {
    timestamp: string;
    weak: Array<{ name: string; accuracy: number; predictions: number }>;
    medium: Array<{ name: string; accuracy: number; predictions: number }>;
    strong: Array<{ name: string; accuracy: number; predictions: number }>;
    jackpots: Array<{ name: string; count: number }>;
    mlSystems: Array<{ name: string; status: string }>;
    summary: {
        totalSystems: number;
        weakCount: number;
        mediumCount: number;
        strongCount: number;
        avgAccuracy: number;
    };
}

async function analyzeSystemPerformance() {
    console.log('📊 ANÁLISE DE PERFORMANCE DE SISTEMAS\n');
    console.log('='.repeat(60));

    try {
        // 1. Fetch rankings
        const rankings = await prisma.systemRanking.findMany({
            orderBy: { avgAccuracy: 'asc' }
        });

        if (rankings.length === 0) {
            console.log('⚠️  Nenhum ranking encontrado na base de dados.');
            return;
        }

        // 2. Categorizar por performance
        const weak = rankings.filter(r => r.avgAccuracy < 20);
        const medium = rankings.filter(r => r.avgAccuracy >= 20 && r.avgAccuracy < 25);
        const strong = rankings.filter(r => r.avgAccuracy >= 25);

        // 3. Calcular média geral
        const avgAccuracy = rankings.reduce((sum, r) => sum + r.avgAccuracy, 0) / rankings.length;

        // 4. Exibir resultados
        console.log(`\n❌ SISTEMAS FRACOS (${weak.length}) - Accuracy < 20%:`);
        console.log('-'.repeat(60));
        if (weak.length > 0) {
            weak.forEach(r => {
                console.log(`  • ${r.systemName.padEnd(35)} ${r.avgAccuracy.toFixed(2)}% (${r.totalPredictions} previsões)`);
            });
        } else {
            console.log('  ✅ Nenhum sistema fraco encontrado!');
        }

        console.log(`\n⚠️  SISTEMAS MÉDIOS (${medium.length}) - Accuracy 20-25%:`);
        console.log('-'.repeat(60));
        if (medium.length > 0) {
            medium.forEach(r => {
                console.log(`  • ${r.systemName.padEnd(35)} ${r.avgAccuracy.toFixed(2)}% (${r.totalPredictions} previsões)`);
            });
        } else {
            console.log('  ℹ️  Nenhum sistema médio encontrado.');
        }

        console.log(`\n✅ SISTEMAS FORTES (${strong.length}) - Accuracy >= 25%:`);
        console.log('-'.repeat(60));
        if (strong.length > 0) {
            strong.forEach(r => {
                console.log(`  • ${r.systemName.padEnd(35)} ${r.avgAccuracy.toFixed(2)}% (${r.totalPredictions} previsões)`);
            });
        } else {
            console.log('  ⚠️  Nenhum sistema forte encontrado.');
        }

        // 5. Análise de Jackpots
        console.log(`\n🏆 JACKPOTS POR SISTEMA (5 acertos):`);
        console.log('-'.repeat(60));

        const performances = await prisma.systemPerformance.groupBy({
            by: ['systemName'],
            _count: { hits: true },
            where: { hits: 5 }
        });

        if (performances.length > 0) {
            performances
                .sort((a, b) => b._count.hits - a._count.hits)
                .forEach(p => {
                    console.log(`  🎯 ${p.systemName.padEnd(35)} ${p._count.hits} jackpot(s)`);
                });
        } else {
            console.log('  ℹ️  Nenhum jackpot registado ainda.');
        }

        // 6. Identificar sistemas ML (comentados no código)
        const mlSystemNames = [
            'LSTM Neural Net',
            'Random Forest AI',
            'ML Classifier',
            'Pattern Based',
            'Standard Deviation',
            'Root Sum',
            'Sistema Elástico'
        ];

        console.log(`\n🧠 SISTEMAS ML (Machine Learning):`);
        console.log('-'.repeat(60));

        const mlSystems = mlSystemNames.map(name => {
            const found = rankings.find(r => r.systemName === name);
            return {
                name,
                status: found ? `Ativo (${found.avgAccuracy.toFixed(2)}%)` : 'Desativado/Não encontrado'
            };
        });

        mlSystems.forEach(ml => {
            const icon = ml.status.includes('Desativado') ? '❌' : '⚠️';
            console.log(`  ${icon} ${ml.name.padEnd(35)} ${ml.status}`);
        });

        // 7. Resumo geral
        console.log(`\n📈 RESUMO GERAL:`);
        console.log('='.repeat(60));
        console.log(`  Total de Sistemas: ${rankings.length}`);
        console.log(`  Sistemas Fracos:   ${weak.length} (${((weak.length / rankings.length) * 100).toFixed(1)}%)`);
        console.log(`  Sistemas Médios:   ${medium.length} (${((medium.length / rankings.length) * 100).toFixed(1)}%)`);
        console.log(`  Sistemas Fortes:   ${strong.length} (${((strong.length / rankings.length) * 100).toFixed(1)}%)`);
        console.log(`  Accuracy Média:    ${avgAccuracy.toFixed(2)}%`);

        // 8. Gerar relatório JSON
        const report: SystemReport = {
            timestamp: new Date().toISOString(),
            weak: weak.map(r => ({
                name: r.systemName,
                accuracy: r.avgAccuracy,
                predictions: r.totalPredictions
            })),
            medium: medium.map(r => ({
                name: r.systemName,
                accuracy: r.avgAccuracy,
                predictions: r.totalPredictions
            })),
            strong: strong.map(r => ({
                name: r.systemName,
                accuracy: r.avgAccuracy,
                predictions: r.totalPredictions
            })),
            jackpots: performances.map(p => ({
                name: p.systemName,
                count: p._count.hits
            })),
            mlSystems,
            summary: {
                totalSystems: rankings.length,
                weakCount: weak.length,
                mediumCount: medium.length,
                strongCount: strong.length,
                avgAccuracy
            }
        };

        const reportPath = path.join(process.cwd(), 'system-performance-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log(`\n✅ Relatório JSON salvo em: ${reportPath}`);
        console.log('='.repeat(60));

        // 9. Recomendações
        console.log(`\n💡 RECOMENDAÇÕES:`);
        console.log('-'.repeat(60));

        if (weak.length > 0) {
            console.log(`  ⚠️  Considerar desativar ${weak.length} sistema(s) fraco(s)`);
        }

        const activeMl = mlSystems.filter(ml => ml.status.includes('Ativo'));
        if (activeMl.length > 0) {
            console.log(`  ⚠️  Desativar ${activeMl.length} sistema(s) ML problemático(s)`);
        }

        if (strong.length > 0) {
            console.log(`  ✅ Replicar ${strong.length} sistema(s) forte(s) para outros jogos`);
        }

        console.log('\n');

    } catch (error) {
        console.error('❌ Erro ao analisar performance:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Executar
analyzeSystemPerformance()
    .then(() => {
        console.log('✅ Análise concluída com sucesso!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Erro fatal:', err);
        process.exit(1);
    });
