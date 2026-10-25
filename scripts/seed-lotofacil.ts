/**
 * Ingestão e Seed Oficial da Lotofácil (Brasil)
 * Descarrega o histórico completo da Lotofácil (3.800+ sorteios) e persiste na Base de Dados
 */
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface RawLotofacilDraw {
    concurso: number;
    data: string; // "DD/MM/YYYY"
    dezenas: string[];
    dezenasOrdemSorteio?: string[];
    acumuladaProxConcurso?: string;
    acumulou?: boolean;
    premiacoes?: Array<{
        descricao: string;
        faixa: number;
        ganhadores: number;
        valorPremio: number;
    }>;
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`🌐 A descarregar de ${url} (tentativa ${attempt})...`);
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            return await res.json();
        } catch (err: any) {
            console.warn(`⚠️ Tentativa ${attempt} falhou: ${err.message}`);
            if (attempt === retries) throw err;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

async function main() {
    console.log('🚀 A iniciar importação histórica da Lotofácil...');

    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const backupFile = path.join(dataDir, 'lotofacil-raw-history.json');
    let draws: RawLotofacilDraw[] = [];

    // 1. Tentar descarregar da API
    try {
        draws = await fetchWithRetry('https://loteriascaixa-api.herokuapp.com/api/lotofacil');
        console.log(`✅ Descarregados ${draws.length} sorteios com sucesso!`);
        
        // Guardar cópia de segurança em disco
        fs.writeFileSync(backupFile, JSON.stringify(draws, null, 2), 'utf8');
        console.log(`💾 Cópia de segurança guardada em: ${backupFile}`);
    } catch (err: any) {
        console.warn('⚠️ Falha ao contactar a API online. A tentar ler cópia local...');
        if (fs.existsSync(backupFile)) {
            draws = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
            console.log(`📂 Carregados ${draws.length} sorteios do ficheiro de cópia local.`);
        } else {
            throw new Error(`Não foi possível obter dados da Lotofácil: ${err.message}`);
        }
    }

    // A API pode devolver por ordem decrescente (mais recente primeiro)
    // Garantir ordenação cronológica crescente (do concurso 1 ao 3808+)
    draws.sort((a, b) => a.concurso - b.concurso);

    console.log(`\n📊 Intervalo histórico: Concurso ${draws[0].concurso} (${draws[0].data}) até Concurso ${draws[draws.length - 1].concurso} (${draws[draws.length - 1].data})`);

    // 2. Preparar e gravar na base de dados
    console.log('\n💾 A limpar e reinserir sorteios da Lotofácil no SQLite...');
    await prisma.draw.deleteMany({ where: { game: 'LOTOFACIL' } });
    let inserted = 0;

    // Agrupar sorteios por data para detetar sorteios duplos no mesmo dia (ex: concurso especial)
    const dateCountMap = new Map<string, number>();

    const batchSize = 100;
    for (let i = 0; i < draws.length; i += batchSize) {
        const batch = draws.slice(i, i + batchSize);
        
        await prisma.$transaction(
            batch.map(draw => {
                const parts = draw.data.split('/');
                const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                
                // Se já houve um sorteio nesta mesma data, adiciona offset de hora para evitar colisão no @@unique([game, date])
                const seenCount = dateCountMap.get(isoDate) || 0;
                dateCountMap.set(isoDate, seenCount + 1);
                
                const hour = seenCount === 0 ? '20' : String(20 - seenCount).padStart(2, '0');
                const drawDate = new Date(`${isoDate}T${hour}:00:00Z`);

                const sortedNums = draw.dezenas
                    .map(d => parseInt(d, 10))
                    .filter(n => !isNaN(n) && n >= 1 && n <= 25)
                    .sort((a, b) => a - b);

                const drawOrderNums = (draw.dezenasOrdemSorteio && draw.dezenasOrdemSorteio.length > 0)
                    ? draw.dezenasOrdemSorteio.map(d => parseInt(d, 10)).filter(n => !isNaN(n))
                    : sortedNums;

                let jackpot = 0;
                if (draw.acumuladaProxConcurso) {
                    const cleanStr = String(draw.acumuladaProxConcurso)
                        .replace('R$', '')
                        .replace(/\./g, '')
                        .replace(',', '.')
                        .trim();
                    jackpot = parseFloat(cleanStr) || 0;
                }

                const hasWinner = !draw.acumulou;
                const winners15 = draw.premiacoes?.find(p => p.faixa === 1)?.ganhadores || 0;

                return prisma.draw.upsert({
                    where: {
                        game_sequenceNumber: {
                            game: 'LOTOFACIL',
                            sequenceNumber: draw.concurso
                        }
                    },
                    update: {
                        date: drawDate,
                        numbers: JSON.stringify(sortedNums),
                        stars: JSON.stringify([]),
                        numbersDrawOrder: JSON.stringify(drawOrderNums),
                        starsDrawOrder: JSON.stringify([]),
                        jackpot,
                        hasWinner,
                        numWinners: winners15
                    },
                    create: {
                        game: 'LOTOFACIL',
                        sequenceNumber: draw.concurso,
                        date: drawDate,
                        numbers: JSON.stringify(sortedNums),
                        stars: JSON.stringify([]),
                        numbersDrawOrder: JSON.stringify(drawOrderNums),
                        starsDrawOrder: JSON.stringify([]),
                        jackpot,
                        hasWinner,
                        numWinners: winners15
                    }
                });
            })
        );

        inserted += batch.length;
        process.stdout.write(`\rProcessados: ${inserted} / ${draws.length} sorteios`);
    }

    console.log(`\n\n🎉 SUCESSO! ${inserted} sorteios da Lotofácil gravados na base de dados!`);

    // Validação final na base de dados
    const count = await prisma.draw.count({ where: { game: 'LOTOFACIL' } });
    const latest = await prisma.draw.findFirst({
        where: { game: 'LOTOFACIL' },
        orderBy: { sequenceNumber: 'desc' }
    });

    console.log(`\n✅ Confirmação na Base de Dados:`);
    console.log(`   - Total de Sorteios registados: ${count}`);
    console.log(`   - Último Concurso: #${latest?.sequenceNumber} em ${latest?.date.toISOString().slice(0, 10)}`);
    console.log(`   - 15 Dezenas: ${latest?.numbers}`);
}

main()
    .catch(err => {
        console.error('\n❌ Erro durante a importação:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
