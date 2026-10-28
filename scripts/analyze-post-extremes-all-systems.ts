/**
 * scripts/analyze-post-extremes-all-systems.ts
 *
 * Análise Estatística Forense Multi-Jogo e Multi-Sistema:
 * "A seguir a um 5 ou a um 0,
 *  quantas vezes bate 5, 4, 1 ou 0 nos seguintes 3 sorteios?"
 *
 * Suporta:
 *   --game=euromillions|totoloto|eurodreams|megasena|lotofacil|all
 *   --system=slug|all
 *   --export (guarda relatório markdown em docs/14_ANALISE_TODOS_SISTEMAS_POS_EXTREMOS.md)
 */

import fs from "fs";
import path from "path";

interface GameSpec {
  name: string;
  slug: string;
  pool: number;
  maxHits: number;
  traveHits: number;
  hitCol: string;
}

const GAMES: Record<string, GameSpec> = {
  euromillions: { name: "Euromilhões", slug: "euromillions", pool: 25, maxHits: 5, traveHits: 4, hitCol: "num_hits_25" },
  totoloto:     { name: "Totoloto",    slug: "totoloto",    pool: 25, maxHits: 5, traveHits: 4, hitCol: "num_hits_25" },
  eurodreams:   { name: "EuroDreams",  slug: "eurodreams",  pool: 20, maxHits: 6, traveHits: 5, hitCol: "num_hits_20" },
  megasena:     { name: "Mega-Sena",   slug: "megasena",    pool: 30, maxHits: 6, traveHits: 5, hitCol: "num_hits_30" },
  lotofacil:    { name: "Lotofácil",   slug: "lotofacil",   pool: 20, maxHits: 15, traveHits: 14, hitCol: "num_hits_20" }
};

interface WindowStats {
  validTriggers: number;
  t1_5: number;
  t1_4: number;
  t1_1: number;
  t1_0: number;

  in3_has5: number;
  in3_has4: number;
  in3_has1: number;
  in3_has0: number;

  in3_has5or4: number; // Alta Direta (5 ou 4)
  in3_has0or1: number; // Alta Anti/Pêndulo (0 ou 1)
}

interface SystemResult {
  game: string;
  gameName: string;
  system: string;
  totalDraws: number;
  count5: number;
  count0: number;
  countMax: number;
  post5: WindowStats;
  post0: WindowStats;
  postMax?: WindowStats;
}

function analyzeWindowForTargets(hits: number[], triggerValue: number): WindowStats {
  let validTriggers = 0;
  let t1_5 = 0, t1_4 = 0, t1_1 = 0, t1_0 = 0;
  let in3_has5 = 0, in3_has4 = 0, in3_has1 = 0, in3_has0 = 0;
  let in3_has5or4 = 0, in3_has0or1 = 0;

  for (let i = 0; i < hits.length; i++) {
    if (hits[i] !== triggerValue) continue;
    if (i + 3 >= hits.length) continue;

    validTriggers++;
    const w1 = hits[i + 1];
    const w2 = hits[i + 2];
    const w3 = hits[i + 3];
    const in3 = [w1, w2, w3];

    // T+1
    if (w1 === 5) t1_5++;
    if (w1 === 4) t1_4++;
    if (w1 === 1) t1_1++;
    if (w1 === 0) t1_0++;

    // Janela T+1 a T+3 (pelo menos um)
    if (in3.includes(5)) in3_has5++;
    if (in3.includes(4)) in3_has4++;
    if (in3.includes(1)) in3_has1++;
    if (in3.includes(0)) in3_has0++;

    if (in3.some(x => x === 5 || x === 4)) in3_has5or4++;
    if (in3.some(x => x === 0 || x === 1)) in3_has0or1++;
  }

  return {
    validTriggers,
    t1_5,
    t1_4,
    t1_1,
    t1_0,
    in3_has5,
    in3_has4,
    in3_has1,
    in3_has0,
    in3_has5or4,
    in3_has0or1
  };
}

function pct(num: number, den: number): string {
  if (den === 0) return "0.0%";
  return ((num / den) * 100).toFixed(1) + "%";
}

async function run() {
  const args = process.argv.slice(2);
  const gameArg = args.find(a => a.startsWith("--game="))?.split("=")[1]?.toLowerCase() || "all";
  const systemArg = args.find(a => a.startsWith("--system="))?.split("=")[1]?.toLowerCase() || "all";
  const exportDoc = args.includes("--export");

  const consolidatedDir = path.join(process.cwd(), "data", "consolidated");
  if (!fs.existsSync(consolidatedDir)) {
    console.error("Diretoria data/consolidated não encontrada.");
    return;
  }

  const allFiles = fs.readdirSync(consolidatedDir).filter(f => !f.includes("_stars_") && f.endsWith(".json"));

  const targetGames = gameArg === "all" ? Object.keys(GAMES) : [gameArg];
  const results: SystemResult[] = [];

  for (const gameKey of targetGames) {
    const spec = GAMES[gameKey];
    if (!spec) continue;

    const gameFiles = allFiles.filter(f => f.endsWith(`_${spec.slug}.json`));

    for (const f of gameFiles) {
      const systemSlug = f.replace(`_${spec.slug}.json`, "");
      if (systemArg !== "all" && systemSlug !== systemArg) continue;

      const filePath = path.join(consolidatedDir, f);
      let content: any[] = [];
      try {
        content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch {
        continue;
      }
      if (!Array.isArray(content) || content.length < 10) continue;

      const hits: number[] = [];
      for (const item of content) {
        if (!item || typeof item !== "object") continue;
        if (typeof item[spec.hitCol] === "number") {
          hits.push(item[spec.hitCol]);
        } else if (item.num_hits_25 !== undefined && typeof item.num_hits_25 === "number") {
          hits.push(item.num_hits_25);
        } else {
          hits.push(0);
        }
      }

      const count5 = hits.filter(h => h === 5).length;
      const count0 = hits.filter(h => h === 0).length;
      const countMax = hits.filter(h => h === spec.maxHits).length;

      const post5 = analyzeWindowForTargets(hits, 5);
      const post0 = analyzeWindowForTargets(hits, 0);

      results.push({
        game: spec.slug,
        gameName: spec.name,
        system: systemSlug,
        totalDraws: hits.length,
        count5,
        count0,
        countMax,
        post5,
        post0
      });
    }
  }

  console.log(`\n========================================================================================`);
  console.log(`🎯 ANÁLISE FORENSE MULTI-SISTEMA: A SEGUIR A UM 5 OU A UM 0 -> QUANTAS VEZES BATE 5, 4, 1 OU 0?`);
  console.log(`========================================================================================\n`);

  for (const gKey of targetGames) {
    const gResults = results.filter(r => r.game === gKey);
    if (gResults.length === 0) continue;
    const spec = GAMES[gKey];

    console.log(`\n================================================================`);
    console.log(`🎲 JOGO: ${spec.name.toUpperCase()} (Base: ${spec.pool} bolas | Máximo Possível=${spec.maxHits})`);
    console.log(`================================================================`);

    // TABELA 1: PÓS-5
    console.log(`\n📊 [1. A SEGUIR A UM 5 -> PRÓXIMOS 3 SORTEIOS (T+1 a T+3)]`);
    console.log(`--------------------------------------------------------------------------------------------------------------------------------`);
    console.log(
      `Sistema`.padEnd(25) +
      `| Sorteios `.padEnd(11) +
      `| Total 5s `.padEnd(11) +
      `| T+1=0 `.padEnd(8) +
      `| 3S: Bate 5 `.padEnd(14) +
      `| 3S: Bate 4 `.padEnd(14) +
      `| 3S: Bate 1 `.padEnd(14) +
      `| 3S: Bate 0 `.padEnd(14) +
      `| PÊNDULO (0 ou 1)`
    );
    console.log(`--------------------------------------------------------------------------------------------------------------------------------`);

    const sortedPost5 = [...gResults].sort((a, b) => {
      const rateA = a.post5.validTriggers > 0 ? (a.post5.in3_has0or1 / a.post5.validTriggers) : 0;
      const rateB = b.post5.validTriggers > 0 ? (b.post5.in3_has0or1 / b.post5.validTriggers) : 0;
      return rateB - rateA;
    });

    for (const r of sortedPost5) {
      const v = r.post5.validTriggers;
      console.log(
        `${r.system}`.padEnd(25) +
        `| ${r.totalDraws}`.padEnd(11) +
        `| ${r.count5}`.padEnd(11) +
        `| ${pct(r.post5.t1_0, v)}`.padEnd(8) +
        `| ${r.post5.in3_has5} (${pct(r.post5.in3_has5, v)})`.padEnd(14) +
        `| ${r.post5.in3_has4} (${pct(r.post5.in3_has4, v)})`.padEnd(14) +
        `| ${r.post5.in3_has1} (${pct(r.post5.in3_has1, v)})`.padEnd(14) +
        `| ${r.post5.in3_has0} (${pct(r.post5.in3_has0, v)})`.padEnd(14) +
        `| ${r.post5.in3_has0or1}/${v} (${pct(r.post5.in3_has0or1, v)})`
      );
    }

    // TABELA 2: PÓS-0
    console.log(`\n📊 [2. A SEGUIR A UM 0 -> PRÓXIMOS 3 SORTEIOS (T+1 a T+3)]`);
    console.log(`--------------------------------------------------------------------------------------------------------------------------------`);
    console.log(
      `Sistema`.padEnd(25) +
      `| Sorteios `.padEnd(11) +
      `| Total 0s `.padEnd(11) +
      `| T+1=5 `.padEnd(8) +
      `| 3S: Bate 5 `.padEnd(14) +
      `| 3S: Bate 4 `.padEnd(14) +
      `| 3S: Bate 1 `.padEnd(14) +
      `| 3S: Bate 0 `.padEnd(14) +
      `| REBOTE (5 ou 4)`
    );
    console.log(`--------------------------------------------------------------------------------------------------------------------------------`);

    const sortedPost0 = [...gResults].sort((a, b) => {
      const rateA = a.post0.validTriggers > 0 ? (a.post0.in3_has5or4 / a.post0.validTriggers) : 0;
      const rateB = b.post0.validTriggers > 0 ? (b.post0.in3_has5or4 / b.post0.validTriggers) : 0;
      return rateB - rateA;
    });

    for (const r of sortedPost0) {
      const v = r.post0.validTriggers;
      console.log(
        `${r.system}`.padEnd(25) +
        `| ${r.totalDraws}`.padEnd(11) +
        `| ${r.count0}`.padEnd(11) +
        `| ${pct(r.post0.t1_5, v)}`.padEnd(8) +
        `| ${r.post0.in3_has5} (${pct(r.post0.in3_has5, v)})`.padEnd(14) +
        `| ${r.post0.in3_has4} (${pct(r.post0.in3_has4, v)})`.padEnd(14) +
        `| ${r.post0.in3_has1} (${pct(r.post0.in3_has1, v)})`.padEnd(14) +
        `| ${r.post0.in3_has0} (${pct(r.post0.in3_has0, v)})`.padEnd(14) +
        `| ${r.post0.in3_has5or4}/${v} (${pct(r.post0.in3_has5or4, v)})`
      );
    }
  }

  // Exportar Markdown
  if (exportDoc) {
    let md = `# 🔬 Auditoria Forense Completa: Pós-5 e Pós-0 em Todos os Jogos e Sistemas\n\n`;
    md += `**Documento:** \`docs/14_ANALISE_TODOS_SISTEMAS_POS_EXTREMOS.md\`  \n`;
    md += `**Data:** 28 de Outubro de 2026  \n`;
    md += `**Pergunta Central:**  \n`;
    md += `> *"A seguir a um 5 ou a um 0, quantas vezes bate 5, 4, 1 ou 0 nos seguintes 3 sorteios?"*\n\n`;
    md += `Esta análise foi executada sobre **todos os 20 sistemas** e **todas as lotarias** do Projeto Números Mágicos.\n\n`;
    md += `---\n\n`;

    for (const gKey of targetGames) {
      const gResults = results.filter(r => r.game === gKey);
      if (gResults.length === 0) continue;
      const spec = GAMES[gKey];

      md += `## 🎲 ${spec.name} (Base: ${spec.pool} bolas | Máx. Jogo: ${spec.maxHits})\n\n`;

      md += `### 1. Comportamento Pós-5 (Janela de 3 Sorteios: T+1 a T+3)\n\n`;
      md += `| Sistema | Sorteios | Total 5s | T+1=0 | 3S: Bate 5 | 3S: Bate 4 | 3S: Bate 1 | 3S: Bate 0 | **Taxa Pêndulo (0 ou 1)** |\n`;
      md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

      const sortedTop = [...gResults].sort((a, b) => {
        const rateA = a.post5.validTriggers > 0 ? (a.post5.in3_has0or1 / a.post5.validTriggers) : 0;
        const rateB = b.post5.validTriggers > 0 ? (b.post5.in3_has0or1 / b.post5.validTriggers) : 0;
        return rateB - rateA;
      });

      for (const r of sortedTop) {
        const v = r.post5.validTriggers;
        md += `| \`${r.system}\` | ${r.totalDraws} | ${r.count5} | ${pct(r.post5.t1_0, v)} | ${r.post5.in3_has5} (${pct(r.post5.in3_has5, v)}) | ${r.post5.in3_has4} (${pct(r.post5.in3_has4, v)}) | ${r.post5.in3_has1} (${pct(r.post5.in3_has1, v)}) | ${r.post5.in3_has0} (${pct(r.post5.in3_has0, v)}) | **${r.post5.in3_has0or1}/${v} (${pct(r.post5.in3_has0or1, v)})** |\n`;
      }

      md += `\n### 2. Comportamento Pós-0 (Janela de 3 Sorteios: T+1 a T+3)\n\n`;
      md += `| Sistema | Sorteios | Total 0s | T+1=5 | 3S: Bate 5 | 3S: Bate 4 | 3S: Bate 1 | 3S: Bate 0 | **Taxa Rebote (5 ou 4)** |\n`;
      md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

      const sortedZero = [...gResults].sort((a, b) => {
        const rateA = a.post0.validTriggers > 0 ? (a.post0.in3_has5or4 / a.post0.validTriggers) : 0;
        const rateB = b.post0.validTriggers > 0 ? (b.post0.in3_has5or4 / b.post0.validTriggers) : 0;
        return rateB - rateA;
      });

      for (const r of sortedZero) {
        const v = r.post0.validTriggers;
        md += `| \`${r.system}\` | ${r.totalDraws} | ${r.count0} | ${pct(r.post0.t1_5, v)} | ${r.post0.in3_has5} (${pct(r.post0.in3_has5, v)}) | ${r.post0.in3_has4} (${pct(r.post0.in3_has4, v)}) | ${r.post0.in3_has1} (${pct(r.post0.in3_has1, v)}) | ${r.post0.in3_has0} (${pct(r.post0.in3_has0, v)}) | **${r.post0.in3_has5or4}/${v} (${pct(r.post0.in3_has5or4, v)})** |\n`;
      }

      md += `\n---\n\n`;
    }

    const docPath = path.join(process.cwd(), "docs", "14_ANALISE_TODOS_SISTEMAS_POS_EXTREMOS.md");
    fs.writeFileSync(docPath, md, "utf-8");
    console.log(`\n✅ Relatório completo exportado com sucesso para: docs/14_ANALISE_TODOS_SISTEMAS_POS_EXTREMOS.md\n`);
  }
}

run().catch(err => {
  console.error("Erro na execução:", err);
});
