import fs from "fs";
import path from "path";

const consolidatedDir = path.join(process.cwd(), "data", "consolidated");

function inspectNextPrediction(file: string): number[] {
  const filePath = path.join(consolidatedDir, file);
  if (!fs.existsSync(filePath)) return [];
  const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const last = content[content.length - 1];
  if (!last || !last.prediction) return [];
  let pred = last.prediction;
  if (typeof pred === "string") {
    try { pred = JSON.parse(pred); } catch { pred = []; }
  }
  return Array.isArray(pred) ? pred.slice(0, 25) : [];
}

const sep = inspectNextPrediction("separacao_aguas_totoloto.json");
const tiro = inspectNextPrediction("tiro_certeiro_totoloto.json");
const med3 = inspectNextPrediction("media_3_otimizado_totoloto.json");
const maisSort = inspectNextPrediction("mais_sorteadas_sempre_totoloto.json");
const monte = inspectNextPrediction("monte_carlo_totoloto.json");
const diag2d = inspectNextPrediction("diagonais_matriz_totoloto.json");

console.log("Separação das Águas:", sep);
console.log("Tiro Certeiro:", tiro);
console.log("Média 3 Otimizado:", med3);
console.log("Mais Sorteadas de Sempre:", maisSort);
console.log("Diagonais 2D:", diag2d);

// Let's count voting across the top systems in Totoloto
const voteCount: Record<number, number> = {};
[sep, tiro, med3, maisSort, diag2d].forEach(sys => {
  if (sys) {
    sys.forEach((n: number) => {
      voteCount[n] = (voteCount[n] || 0) + 1;
    });
  }
});

const sortedByVotes = Object.entries(voteCount)
  .map(([num, count]) => ({ num: Number(num), count }))
  .sort((a, b) => b.count - a.count);

console.log("\nNúmeros mais votados pelo consenso dos 5 sistemas de topo no Totoloto:");
console.log(sortedByVotes.slice(0, 25));
