import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const GAMES = [
  { game: 'EUROMILLIONS', slug: 'euromillions', maxNum: 50, predCount: 25, maxHits: 5 },
  { game: 'TOTOLOTO', slug: 'totoloto', maxNum: 49, predCount: 25, maxHits: 5 },
  { game: 'EURODREAMS', slug: 'eurodreams', maxNum: 40, predCount: 20, maxHits: 6 },
  { game: 'MEGASENA', slug: 'megasena', maxNum: 60, predCount: 30, maxHits: 6 }
];

const NEW_SYSTEMS = [
  {
    name: 'Harmonia Dimensional (Antigravity)',
    slug: 'harmonia_antigravity',
    description: 'Sistema inovador Antigravity: Ressonância Hiperbólica, Tensão Elástica de Atraso e Quotas Dimensionais',
    systemType: 'base'
  },
  {
    name: 'Separação das Águas 2.0',
    slug: 'separacao_aguas_v2',
    description: 'Ensemble de 5 Especialistas com Inversão Cirúrgica de Polaridade para Máxima Assimetria',
    systemType: 'ensemble'
  }
];

function calculateHits(prediction: number[], actual: number[]) {
  const hits: Record<string, number> = {};
  for (const cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
    const top = new Set(prediction.slice(0, cut));
    hits['num_hits_' + cut] = actual.filter(n => top.has(n)).length;
  }
  return hits;
}

async function syncSystem(sys: typeof NEW_SYSTEMS[0], g: typeof GAMES[0]) {
  console.log(`\n--- Sincronizando ${sys.name} para ${g.game} ---`);

  // 1. Upsert RankedSystem
  await prisma.rankedSystem.upsert({
    where: {
      name_game: {
        name: sys.name,
        game: g.game
      }
    },
    update: {
      description: sys.description,
      domain: 'NUMBERS',
      systemType: sys.systemType,
      isActive: true
    },
    create: {
      name: sys.name,
      game: g.game,
      description: sys.description,
      domain: 'NUMBERS',
      systemType: sys.systemType,
      isActive: true
    }
  });

  // 2. Ler ficheiro consolidado
  const consolidatedDir = path.join(process.cwd(), 'data', 'consolidated');
  const fileName = `${sys.slug}_${g.slug}.json`;
  const filePath = path.join(consolidatedDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Ficheiro ${fileName} não encontrado. A saltar.`);
    return;
  }

  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`Lidos ${rawData.length} registos de ${fileName}.`);

  // 3. Obter todos os sorteios de Prisma DB
  const draws = await prisma.draw.findMany({
    where: { game: g.game },
    orderBy: { date: 'asc' }
  });

  const drawMap = new Map<number, { id: number; numbers: number[] }>();
  draws.forEach(d => {
    let nums: number[] = [];
    if (typeof d.numbers === 'string') {
      try { nums = JSON.parse(d.numbers); } catch {}
    } else if (Array.isArray(d.numbers)) {
      nums = d.numbers as unknown as number[];
    }
    drawMap.set(d.id, { id: d.id, numbers: nums });
  });

  // 4. Limpar registos anteriores
  const deleted = await prisma.systemPrediction.deleteMany({
    where: {
      game: g.game,
      systemName: sys.name,
      domain: 'NUMBERS'
    }
  });
  if (deleted.count > 0) {
    console.log(`Eliminados ${deleted.count} registos antigos.`);
  }

  // 5. Preparar registos
  const recordsToInsert: any[] = [];
  const predCutKey = 'num_hits_' + g.predCount;
  let jackpotsCount = 0;
  let highPrizesCount = 0;

  for (const item of rawData) {
    const draw = drawMap.get(item.drawId);
    if (!draw) continue;

    let prediction: number[] = [];
    if (Array.isArray(item.prediction)) {
      prediction = item.prediction;
    } else if (typeof item.prediction === 'string') {
      try { prediction = JSON.parse(item.prediction); } catch { prediction = []; }
    }
    if (prediction.length === 0) continue;

    let hits: Record<string, number> = {};
    if (item.num_hits_25 !== undefined && item.num_hits_5 !== undefined) {
      for (const cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
        hits['num_hits_' + cut] = item[`num_hits_${cut}`] ?? 0;
      }
    } else {
      hits = calculateHits(prediction, draw.numbers);
    }

    if (hits[predCutKey] === g.maxHits) jackpotsCount++;
    if (hits[predCutKey] === g.maxHits - 1) highPrizesCount++;

    recordsToInsert.push({
      drawId: draw.id,
      game: g.game,
      domain: 'NUMBERS',
      systemName: sys.name,
      prediction: JSON.stringify(prediction),
      cutoff: g.maxNum,
      ...hits,
      calculatedAt: new Date()
    });
  }

  console.log(`A inserir ${recordsToInsert.length} registos... (Jackpots: ${jackpotsCount}, Traves: ${highPrizesCount})`);

  const chunkSize = 250;
  for (let b = 0; b < recordsToInsert.length; b += chunkSize) {
    const chunk = recordsToInsert.slice(b, b + chunkSize);
    await prisma.systemPrediction.createMany({
      data: chunk
    });
  }

  // 6. Atualizar estatísticas de desempenho na tabela RankedSystem se necessário
  console.log(`✅ ${sys.name} sincronizado com sucesso (${recordsToInsert.length} previsões inseridas).`);
}

async function main() {
  for (const g of GAMES) {
    for (const sys of NEW_SYSTEMS) {
      await syncSystem(sys, g);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
