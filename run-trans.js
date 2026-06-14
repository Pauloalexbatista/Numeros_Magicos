const fs = require('fs');

const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const es = JSON.parse(fs.readFileSync('messages/es.json', 'utf8'));
const fr = JSON.parse(fs.readFileSync('messages/fr.json', 'utf8'));
const pt = JSON.parse(fs.readFileSync('messages/pt.json', 'utf8'));

const rankingTranslations = {
  pt: {
    kings_title: "Reis do Jackpot (Histórico)",
    kings_desc: "Sistemas com mais prêmios máximos desde sempre.",
    jackpots: "Jackpots",
    full_history: "Histórico Completo",
    last_100: "Últimos 100",
    last_20: "Últimos 20",
    win_rate: "Win Rate",
    score: "Score",
    default_desc: "Sistema de previsão estatística.",
    champions_title: "Liga dos Campeões",
    champions_desc: "Análise histórica de Jackpots ({j_num} números) e Prêmios Altos ({p_num} números).",
    position: "Posição",
    system: "Sistema",
    jackpots_label: "Jackpots ({num})",
    high_prizes_ed: "Prêmios Altos ({num})",
    high_prizes_std: "2º Prêmio ({num})"
  },
  en: {
    kings_title: "Jackpot Kings (Historical)",
    kings_desc: "Systems with the most maximum prizes of all time.",
    jackpots: "Jackpots",
    full_history: "Full History",
    last_100: "Last 100",
    last_20: "Last 20",
    win_rate: "Win Rate",
    score: "Score",
    default_desc: "Statistical prediction system.",
    champions_title: "Champions League",
    champions_desc: "Historical analysis of Jackpots ({j_num} numbers) and High Prizes ({p_num} numbers).",
    position: "Position",
    system: "System",
    jackpots_label: "Jackpots ({num})",
    high_prizes_ed: "High Prizes ({num})",
    high_prizes_std: "2nd Prize ({num})"
  },
  es: {
    kings_title: "Reyes del Jackpot (Histórico)",
    kings_desc: "Sistemas con más premios máximos de todos los tiempos.",
    jackpots: "Jackpots",
    full_history: "Historial Completo",
    last_100: "Últimos 100",
    last_20: "Últimos 20",
    win_rate: "Win Rate",
    score: "Puntuación",
    default_desc: "Sistema de predicción estadística.",
    champions_title: "Liga de Campeones",
    champions_desc: "Análisis histórico de Jackpots ({j_num} números) y Premios Altos ({p_num} números).",
    position: "Posición",
    system: "Sistema",
    jackpots_label: "Jackpots ({num})",
    high_prizes_ed: "Premios Altos ({num})",
    high_prizes_std: "2º Premio ({num})"
  },
  fr: {
    kings_title: "Rois du Jackpot (Historique)",
    kings_desc: "Systèmes avec le plus de prix maximums de tous les temps.",
    jackpots: "Jackpots",
    full_history: "Historique Complet",
    last_100: "100 Derniers",
    last_20: "20 Derniers",
    win_rate: "Win Rate",
    score: "Score",
    default_desc: "Système de prédiction statistique.",
    champions_title: "Ligue des Champions",
    champions_desc: "Analyse historique des Jackpots ({j_num} numéros) et Hauts Prix ({p_num} numéros).",
    position: "Position",
    system: "Système",
    jackpots_label: "Jackpots ({num})",
    high_prizes_ed: "Hauts Prix ({num})",
    high_prizes_std: "2e Prix ({num})"
  }
};

pt.ranking = rankingTranslations.pt;
en.ranking = rankingTranslations.en;
es.ranking = rankingTranslations.es;
fr.ranking = rankingTranslations.fr;

fs.writeFileSync('messages/pt.json', JSON.stringify(pt, null, 2), 'utf8');
fs.writeFileSync('messages/en.json', JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync('messages/es.json', JSON.stringify(es, null, 2), 'utf8');
fs.writeFileSync('messages/fr.json', JSON.stringify(fr, null, 2), 'utf8');

console.log("Translation files updated.");

// Update TopSystemsAnalysis.tsx
let topSys = fs.readFileSync('src/components/TopSystemsAnalysis.tsx', 'utf8');

if (!topSys.includes("useTranslations")) {
  topSys = topSys.replace("import { Card } from '@/components/ui/card';", "import { Card } from '@/components/ui/card';\nimport { useTranslations } from 'next-intl';");
  
  topSys = topSys.replace("export function TopSystemsAnalysis({ data, game = 'EUROMILLIONS' }: TopSystemsAnalysisProps) {", 
  "export function TopSystemsAnalysis({ data, game = 'EUROMILLIONS' }: TopSystemsAnalysisProps) {\n    const t = useTranslations('ranking');");

  topSys = topSys.replace("const isEuroDreams = game === 'EURODREAMS';", "const isEuroDreams = game === 'EURODREAMS';\n    const isMegaSena = game === 'MEGASENA';\n    const is6Jackpot = isEuroDreams || isMegaSena;");
  
  topSys = topSys.replace("const jackpotLabel = isEuroDreams ? 'Jackpots (6) 🎯' : 'Jackpots (5) 🎯';", 
  "const jackpotLabel = `${t('jackpots_label', { num: is6Jackpot ? 6 : 5 })} 🎯`;");
  
  topSys = topSys.replace("const highPrizeLabel = isEuroDreams ? 'Prêmios Altos (5) 💰' : '2º Prêmio (4) 💰';", 
  "const highPrizeLabel = `${isEuroDreams ? t('high_prizes_ed', { num: 5 }) : isMegaSena ? t('high_prizes_ed', { num: 5 }) : t('high_prizes_std', { num: 4 })} 💰`;");

  topSys = topSys.replace(/<h2 className="text-2xl font-bold flex items-center gap-2" style=\{\{ color: "var\(--accent\)" \}\}>\s*.*? Liga dos Campeões\s*<\/h2>/g, 
  '<h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--accent)" }}>\n                        🏆 {t("champions_title")}\n                    </h2>');

  topSys = topSys.replace(/<p className="text-muted-foreground text-sm">\s*Análise histórica de Jackpots \(\{isEuroDreams \? '6' : '5'\} números\) e Prêmios Altos \(\{isEuroDreams \? '5' : '4'\} números\)\.\s*<\/p>/g,
  '<p className="text-muted-foreground text-sm">\n                        {t("champions_desc", { j_num: is6Jackpot ? 6 : 5, p_num: is6Jackpot ? 5 : 4 })}\n                    </p>');

  topSys = topSys.replace(/<th className="py-3 px-4">Posição<\/th>/g, '<th className="py-3 px-4">{t("position")}</th>');
  topSys = topSys.replace(/<th className="py-3 px-4">Sistema<\/th>/g, '<th className="py-3 px-4">{t("system")}</th>');

  fs.writeFileSync('src/components/TopSystemsAnalysis.tsx', topSys, 'utf8');
  console.log("TopSystemsAnalysis updated.");
}

// Update page.tsx
let page = fs.readFileSync('src/app/ranking/[game]/page.tsx', 'utf8');

if (!page.includes("getTranslations")) {
  page = page.replace("import { notFound } from 'next/navigation';", "import { notFound } from 'next/navigation';\nimport { getTranslations } from 'next-intl/server';");
  
  page = page.replace("export default async function RankingPage({ params, searchParams }: PageProps) {", "export default async function RankingPage({ params, searchParams }: PageProps) {\n    const t = await getTranslations('ranking');");
  
  page = page.replace(/<h2 className="text-xl font-bold text-foreground">Reis do Jackpot \(Histórico\)<\/h2>/g, '<h2 className="text-xl font-bold text-foreground">{t("kings_title")}</h2>');
  
  page = page.replace(/<p className="text-sm text-muted-foreground">Sistemas com mais prêmios máximos desde sempre\.<\/p>/g, '<p className="text-sm text-muted-foreground">{t("kings_desc")}</p>');
  
  page = page.replace(/<span className="block text-\[10px\] uppercase font-semibold text-muted-foreground">Jackpots<\/span>/g, '<span className="block text-[10px] uppercase font-semibold text-muted-foreground">{t("jackpots")}</span>');
  
  page = page.replace(/Histórico Completo/g, '{t("full_history")}');
  page = page.replace(/Últimos 100/g, '{t("last_100")}');
  page = page.replace(/Últimos 20/g, '{t("last_20")}');
  
  page = page.replace(/\{\(sys as any\)\.description \|\| 'Sistema de previsão estatística\.'\}/g, "{(sys as any).description || t('default_desc')}");
  
  page = page.replace(/<span className="text-\[10px\] uppercase tracking-widest text-muted-foreground block mb-1 font-semibold">Win Rate<\/span>/g, '<span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 font-semibold">{t("win_rate")}</span>');
  
  page = page.replace(/<span className="text-\[10px\] uppercase tracking-widest text-muted-foreground block mb-1 font-semibold">Score<\/span>/g, '<span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 font-semibold">{t("score")}</span>');
  
  fs.writeFileSync('src/app/ranking/[game]/page.tsx', page, 'utf8');
  console.log("page.tsx updated.");
}

