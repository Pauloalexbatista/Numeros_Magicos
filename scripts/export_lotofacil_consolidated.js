const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const SYSTEM_SLUG_MAP = {
  'Agrupamento de Padrões (Clustering)': 'clustering',
  'Diagonais da Matriz': 'diagonais_matriz',
  'Diagonais da Matriz 3D': 'diagonais_matriz_3d',
  'Geometria & Ciclos': 'geometria_ciclos',
  'Mais Quentes': 'mais_quentes',
  'Mais Sorteadas de Sempre': 'mais_sorteadas_sempre',
  'Matriz de Corte': 'matriz_corte',
  'Monte Carlo': 'monte_carlo',
  'Pirâmide de Intervalos': 'piramide_intervalos',
  'Pirâmide de Pascal': 'piramide_pascal',
  'Random Forest AI': 'random_forest',
  'Separação das Águas': 'separacao_aguas',
  'Sistema Média +3 Otimizado': 'media_3_otimizado',
  'Sistema Oscilação Universal V2': 'oscilacao_universal',
  'SuperSistema Neuronal': 'supersistema_neuronal',
  'Tiro Certeiro': 'tiro_certeiro',
  'Transições de Markov': 'markov',
  'Últimos a Sair': 'ultimos_a_sair'
};

function main() {
  console.log('🚀 A exportar ficheiros consolidados da Lotofácil a partir do dev.db...');
  const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
  const db = new DatabaseSync(dbPath, { readOnly: true });

  const outDir = path.join(__dirname, '..', 'data', 'consolidated');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Obter todos os sorteios da Lotofácil ordenados por data
  const draws = db.prepare('SELECT id, date, numbers FROM Draw WHERE game = ? ORDER BY date ASC').all('LOTOFACIL');
  console.log(`Encontrados ${draws.length} sorteios da Lotofácil.`);

  const drawMap = new Map();
  draws.forEach((d, idx) => {
    const dateStr = typeof d.date === 'number' ? new Date(d.date).toISOString() : String(d.date);
    drawMap.set(d.id, {
      seq: idx + 1,
      date: dateStr,
      numbers: d.numbers
    });
  });

  for (const [dbSystemName, slug] of Object.entries(SYSTEM_SLUG_MAP)) {
    const filename = `${slug}_lotofacil.json`;
    const targetFile = path.join(outDir, filename);

    const rows = db.prepare(`
      SELECT sp.drawId, sp.prediction, sp.cutoff,
             sp.num_hits_5, sp.num_hits_10, sp.num_hits_15, sp.num_hits_20, sp.num_hits_25,
             sp.num_hits_30, sp.num_hits_35, sp.num_hits_40, sp.num_hits_45, sp.num_hits_50
      FROM SystemPrediction sp
      JOIN Draw d ON sp.drawId = d.id
      WHERE d.game = 'LOTOFACIL' AND sp.systemName = ?
      ORDER BY d.date ASC
    `).all(dbSystemName);

    if (rows.length === 0) {
      console.warn(`⚠️ Nenhuma predição para ${dbSystemName} (${slug})`);
      continue;
    }

    const consolidatedData = rows.map(r => {
      const dInfo = drawMap.get(r.drawId);
      return {
        drawId: r.drawId,
        prediction: r.prediction,
        cutoff: r.cutoff || 25,
        num_hits_5: r.num_hits_5 ?? null,
        num_hits_10: r.num_hits_10 ?? null,
        num_hits_15: r.num_hits_15 ?? null,
        num_hits_20: r.num_hits_20 ?? null,
        num_hits_25: r.num_hits_25 ?? null,
        num_hits_30: r.num_hits_30 ?? null,
        num_hits_35: r.num_hits_35 ?? null,
        num_hits_40: r.num_hits_40 ?? null,
        num_hits_45: r.num_hits_45 ?? null,
        num_hits_50: r.num_hits_50 ?? null,
        draw: dInfo ? {
          date: dInfo.date,
          numbers: dInfo.numbers
        } : undefined
      };
    });

    fs.writeFileSync(targetFile, JSON.stringify(consolidatedData), 'utf8');
    console.log(`✅ Gerado: ${filename} (${consolidatedData.length} registos)`);
  }

  console.log('\n🎉 Exportação de todos os 18 sistemas da Lotofácil concluída com sucesso!');
}

main();
