import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.POSTGRES_URL_PROD;

const GAMES = [
  { game: 'EUROMILLIONS', slug: 'euromillions' },
  { game: 'TOTOLOTO', slug: 'totoloto' },
  { game: 'EURODREAMS', slug: 'eurodreams' },
  { game: 'MEGASENA', slug: 'megasena' },
  { game: 'LOTOFACIL', slug: 'lotofacil' }
];

const ALIASES: Record<string, string[]> = {
  clustering: ["agrupamentodepadroesclustering", "agrupamento", "clustering", "agrupamentodepadroes"],
  oscilacao_universal: ["sistemaoscilacaouniversalv2", "sistemaoscilacaouniversal", "oscilacaouniversal"],
  markov: ["transicoesdemarkov", "cadeiademarkov", "markov"],
  media_3_otimizado: ["sistemamedia3otimizado", "media3otimizado"],
  diagonais_matriz: ["diagonaisdamatriz"],
  diagonais_matriz_3d: ["diagonaisdamatriz3d"],
  random_forest: ["randomforest", "randomforestai"],
  supersistema_neuronal: ["supersistemaneuronal", "supersistema"],
  separacao_aguas: ["separacaodasaguas"],
  tiro_certeiro: ["tirocerteiro"],
  mais_quentes: ["maisquentes"],
  mais_sorteadas_sempre: ["maissorteadasdesempre"],
  ultimos_a_sair: ["ultimosasair", "ultimasasair"],
  piramide_pascal: ["piramidedepascal"],
  piramide_intervalos: ["piramidedeintervalos"],
  monte_carlo: ["montecarlo"],
  matriz_corte: ["matrizdecorte"],
  geometria_ciclos: ["geometriaciclos", "geometriaeciclos", "geometria"]
};

function normalizeText(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function matchesSystem(slug: string, dbSystemName: string, isStars: boolean): boolean {
  const sNorm = normalizeText(slug);
  let dbNorm = normalizeText(dbSystemName);
  if (isStars) {
    dbNorm = dbNorm.replace("estrelas", "").replace("sonhos", "");
  }
  if (slug === "diagonais_matriz" && dbNorm.includes("3d")) return false;
  if (dbNorm === sNorm) return true;
  const list = ALIASES[slug];
  if (list && list.some(a => dbNorm === a || dbNorm.startsWith(a))) return true;
  return false;
}

async function syncConsolidated() {
  const client = new Client({ connectionString });
  await client.connect();

  const consolidatedDir = path.join(process.cwd(), "data", "consolidated");
  const allFiles = fs.readdirSync(consolidatedDir).filter(f => f.endsWith(".json"));

  for (const g of GAMES) {
    console.log(`\n================ Syncing ${g.game} ================`);
    const drawsRes = await client.query(`
      SELECT id, date, numbers, stars 
      FROM "Draw" 
      WHERE game = $1 
      ORDER BY date ASC
    `, [g.game]);
    const dbDraws = drawsRes.rows;
    console.log(`DB draws for ${g.game}: ${dbDraws.length}`);

    // Fetch all predictions for this game
    const predsRes = await client.query(`
      SELECT "drawId", "systemName", domain, cutoff, prediction,
             num_hits_5, num_hits_10, num_hits_15, num_hits_20, num_hits_25,
             num_hits_30, num_hits_35, num_hits_40, num_hits_45, num_hits_50,
             num_hits_55, num_hits_60,
             star_hits_2, star_hits_4, star_hits_6, star_hits_8, star_hits_10, star_hits_12
      FROM "SystemPrediction"
      WHERE game = $1
    `, [g.game]);
    const allPreds = predsRes.rows;
    console.log(`Total predictions in DB for ${g.game}: ${allPreds.length}`);

    const gameFiles = allFiles.filter(f => f.endsWith(`_${g.slug}.json`));

    for (const f of gameFiles) {
      const isStars = f.includes("_stars_");
      const slug = isStars
        ? f.replace(`_stars_${g.slug}.json`, "")
        : f.replace(`_${g.slug}.json`, "");

      const filePath = path.join(consolidatedDir, f);
      let content: any[] = [];
      try {
        content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {
        continue;
      }
      if (!Array.isArray(content)) continue;

      const currentCount = content.length;
      if (currentCount >= dbDraws.length) {
        // Already up to date
        continue;
      }

      const missingDraws = dbDraws.slice(currentCount);
      console.log(`File ${f}: current=${currentCount}, target=${dbDraws.length}. Adding ${missingDraws.length} draws...`);

      for (let i = 0; i < missingDraws.length; i++) {
        const d = missingDraws[i];
        const pred = allPreds.find(p => p.drawId === d.id && matchesSystem(slug, p.systemName, isStars) && (isStars ? p.domain === 'STARS' : p.domain === 'NUMBERS'));

        const newRecord: any = {
          drawId: d.id,
          prediction: pred?.prediction || "[]",
          cutoff: pred?.cutoff || 50,
          num_hits_5: pred?.num_hits_5 ?? 0,
          num_hits_10: pred?.num_hits_10 ?? 0,
          num_hits_15: pred?.num_hits_15 ?? 0,
          num_hits_20: pred?.num_hits_20 ?? 0,
          num_hits_25: pred?.num_hits_25 ?? 0,
          num_hits_30: pred?.num_hits_30 ?? 0,
          num_hits_35: pred?.num_hits_35 ?? 0,
          num_hits_40: pred?.num_hits_40 ?? 0,
          num_hits_45: pred?.num_hits_45 ?? 0,
          num_hits_50: pred?.num_hits_50 ?? 0,
          num_hits_55: pred?.num_hits_55 ?? 0,
          num_hits_60: pred?.num_hits_60 ?? 0,
          star_hits_2: pred?.star_hits_2 ?? 0,
          star_hits_4: pred?.star_hits_4 ?? 0,
          star_hits_6: pred?.star_hits_6 ?? 0,
          star_hits_8: pred?.star_hits_8 ?? 0,
          star_hits_10: pred?.star_hits_10 ?? 0,
          star_hits_12: pred?.star_hits_12 ?? 0,
          draw: {
            date: d.date.toISOString(),
            numbers: typeof d.numbers === "string" ? d.numbers : JSON.stringify(d.numbers),
            stars: d.stars ? (typeof d.stars === "string" ? d.stars : JSON.stringify(d.stars)) : undefined
          }
        };

        content.push(newRecord);
      }

      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
      console.log(`Updated ${f} -> now ${content.length} draws.`);
    }
  }

  await client.end();
  console.log("\n✅ All consolidated files synchronized successfully!");
}

syncConsolidated().catch(console.error);
