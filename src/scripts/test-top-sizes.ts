import { PrismaClient } from '@prisma/client'
import { rankedSystems } from '../services/ranked-systems'

const prisma = new PrismaClient()

interface TestResult {
    topSize: number
    system: string
    avgHits: number
    avgAccuracy: number
    totalTests: number
}

/**
 * Helper to parse numbers from Draw
 */
function parseNumbers(draw: any): number[] {
    if (typeof draw.numbers === 'string') {
        return JSON.parse(draw.numbers)
    }
    return draw.numbers as unknown as number[]
}

/**
 * Test a system with different top sizes
 */
async function testSystemWithTopSize(
    systemName: string,
    generateFn: any,
    draws: any[],
    topSize: number
): Promise<TestResult> {
    let totalHits = 0
    let testsRun = 0

    // Test on last 100 draws
    const testDraws = draws.slice(0, 100)

    for (let i = 0; i < testDraws.length; i++) {
        const currentDraw = testDraws[i]
        const historicalDraws = draws.slice(i + 1, i + 201) // Use 200 historical draws

        if (historicalDraws.length < 50) continue // Need enough history

        try {
            // Generate prediction
            let predicted = await generateFn(historicalDraws)

            // Adjust to top size
            predicted = predicted.slice(0, topSize)

            // Get actual numbers
            const actual = parseNumbers(currentDraw)

            // Count hits
            const hits = predicted.filter((num: number) => actual.includes(num)).length

            totalHits += hits
            testsRun++
        } catch (error) {
            console.error(`Error testing ${systemName}:`, error)
        }
    }

    const avgHits = testsRun > 0 ? totalHits / testsRun : 0
    const avgAccuracy = (avgHits / 5) * 100

    return {
        topSize,
        system: systemName,
        avgHits,
        avgAccuracy,
        totalTests: testsRun
    }
}

/**
 * Main test function
 */
async function testTopSizes() {
    console.log('🔬 TESTE DE TOP SIZES - Bolas Mágicas\n')
    console.log('='.repeat(80))
    console.log('Testando Top 10, 15, 20, 25 em todos os sistemas')
    console.log('Usando últimos 100 sorteios para validação')
    console.log('='.repeat(80))
    console.log()

    // Get all draws
    console.log('📊 A carregar sorteios da base de dados...')
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    })
    console.log(`✅ ${draws.length} sorteios carregados\n`)

    const topSizes = [10, 15, 20, 25]
    const results: TestResult[] = []

    // Test each system with each top size
    for (const system of rankedSystems) {
        console.log(`\n🎯 Testando: ${system.name}`)
        console.log('-'.repeat(80))

        for (const topSize of topSizes) {
            process.stdout.write(`  Top ${topSize}... `)

            const result = await testSystemWithTopSize(
                system.name,
                system.generateTop10,
                draws,
                topSize
            )

            results.push(result)

            console.log(`${result.avgAccuracy.toFixed(2)}% (${result.avgHits.toFixed(2)} acertos/sorteio)`)
        }
    }

    // Display summary
    console.log('\n\n')
    console.log('='.repeat(80))
    console.log('📊 RESUMO DOS RESULTADOS')
    console.log('='.repeat(80))
    console.log()

    for (const topSize of topSizes) {
        console.log(`\n🎯 TOP ${topSize}:`)
        console.log('-'.repeat(80))

        const sizeResults = results
            .filter(r => r.topSize === topSize)
            .sort((a, b) => b.avgAccuracy - a.avgAccuracy)

        sizeResults.forEach((r, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  '
            const improvement = ((r.avgAccuracy / 20) - 1) * 100
            const arrow = improvement > 0 ? '📈' : improvement < 0 ? '📉' : '➡️'

            console.log(
                `${medal} ${r.system.padEnd(20)} | ` +
                `${r.avgAccuracy.toFixed(2)}% | ` +
                `${r.avgHits.toFixed(2)} acertos | ` +
                `${arrow} ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}% vs baseline`
            )
        })
    }

    // Best overall
    console.log('\n\n')
    console.log('='.repeat(80))
    console.log('🏆 MELHOR CONFIGURAÇÃO')
    console.log('='.repeat(80))
    console.log()

    const best = results.reduce((prev, current) =>
        current.avgAccuracy > prev.avgAccuracy ? current : prev
    )

    console.log(`🥇 Sistema: ${best.system}`)
    console.log(`🎯 Top Size: ${best.topSize}`)
    console.log(`📊 Precisão: ${best.avgAccuracy.toFixed(2)}%`)
    console.log(`✅ Acertos Médios: ${best.avgHits.toFixed(2)} por sorteio`)
    console.log(`📈 Melhoria vs Baseline (20%): +${((best.avgAccuracy / 20 - 1) * 100).toFixed(1)}%`)

    // Comparison table
    console.log('\n\n')
    console.log('='.repeat(80))
    console.log('📈 COMPARAÇÃO POR SISTEMA')
    console.log('='.repeat(80))
    console.log()

    for (const system of rankedSystems) {
        console.log(`\n${system.name}:`)
        const systemResults = results
            .filter(r => r.system === system.name)
            .sort((a, b) => a.topSize - b.topSize)

        systemResults.forEach(r => {
            const bar = '█'.repeat(Math.round(r.avgAccuracy / 2))
            console.log(`  Top ${r.topSize.toString().padStart(2)}: ${r.avgAccuracy.toFixed(2)}% ${bar}`)
        })
    }

    console.log('\n\n')
    console.log('='.repeat(80))
    console.log('✅ TESTE COMPLETO!')
    console.log('='.repeat(80))

    await prisma.$disconnect()
}

// Run test
testTopSizes().catch(console.error)
