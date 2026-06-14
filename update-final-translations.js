const fs = require('fs');

const updateJSON = (lang, newLabels, newGameProps) => {
  const p = `messages/${lang}.json`;
  if (fs.existsSync(p)) {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!j.games) j.games = { labels: {} };
    
    // Add missing labels
    Object.assign(j.games.labels, newLabels);
    
    // Add missing game properties
    Object.keys(newGameProps).forEach(game => {
      if (!j.games[game]) j.games[game] = {};
      Object.assign(j.games[game], newGameProps[game]);
    });
    
    fs.writeFileSync(p, JSON.stringify(j, null, 2), 'utf8');
  }
};

updateJSON('pt', {
  numbers: 'Números',
  supplement: 'Suplementar',
  rightDisclaimer: 'As análises são puramente estatísticas e não garantem ganhos. Jogue com responsabilidade.',
  stats_analysis: 'ANÁLISE ESTATÍSTICA',
  routes: { dashboard: 'Dashboard', ranking: 'Ranking', probabilities: 'Probabilidades', patterns: 'Padrões' }
}, {
  euromillions: { numbers: '1–50', supplement: '2 estrelas (1–12)' },
  totoloto: { numbers: '1–49', supplement: '1 número suplementar' },
  eurodreams: { numbers: '1–40', supplement: '1 Número de Sonho (1–5)' },
  megasena: { numbers: '01–60', supplement: 'Sem suplementar' }
});

updateJSON('en', {
  numbers: 'Numbers',
  supplement: 'Supplementary',
  rightDisclaimer: 'Analyzes are purely statistical and do not guarantee winnings. Play responsibly.',
  stats_analysis: 'STATISTICAL ANALYSIS',
  routes: { dashboard: 'Dashboard', ranking: 'Ranking', probabilities: 'Probabilities', patterns: 'Patterns' }
}, {
  euromillions: { numbers: '1–50', supplement: '2 stars (1–12)' },
  totoloto: { numbers: '1–49', supplement: '1 supplementary number' },
  eurodreams: { numbers: '1–40', supplement: '1 Dream Number (1–5)' },
  megasena: { numbers: '01–60', supplement: 'No supplementary' }
});

updateJSON('es', {
  numbers: 'Números',
  supplement: 'Suplementario',
  rightDisclaimer: 'Los análisis son puramente estadísticos y no garantizan ganancias. Juega responsablemente.',
  stats_analysis: 'ANÁLISIS ESTADÍSTICO',
  routes: { dashboard: 'Dashboard', ranking: 'Ranking', probabilities: 'Probabilidades', patterns: 'Patrones' }
}, {
  euromillions: { numbers: '1–50', supplement: '2 estrellas (1–12)' },
  totoloto: { numbers: '1–49', supplement: '1 número suplementario' },
  eurodreams: { numbers: '1–40', supplement: '1 Número de Sueño (1–5)' },
  megasena: { numbers: '01–60', supplement: 'Sin suplementario' }
});

updateJSON('fr', {
  numbers: 'Numéros',
  supplement: 'Supplémentaire',
  rightDisclaimer: 'Les analyses sont purement statistiques et ne garantissent pas de gains. Jouez de manière responsable.',
  stats_analysis: 'ANALYSE STATISTIQUE',
  routes: { dashboard: 'Tableau de bord', ranking: 'Classement', probabilities: 'Probabilités', patterns: 'Modèles' }
}, {
  euromillions: { numbers: '1–50', supplement: '2 étoiles (1–12)' },
  totoloto: { numbers: '1–49', supplement: '1 numéro supplémentaire' },
  eurodreams: { numbers: '1–40', supplement: '1 Numéro Rêve (1–5)' },
  megasena: { numbers: '01–60', supplement: 'Sans supplémentaire' }
});

// Update page.tsx to use these properties instead of hardcoded ones
let code = fs.readFileSync('src/app/games/page.tsx', 'utf8');

// Replace {selected.numbers} with {t(`${selected.id}.numbers`)}
code = code.replace(/\{selected\.numbers\}/g, '{t(`${selected.id}.numbers`)}');

// Replace {selected.supplement} with {t(`${selected.id}.supplement`)}
code = code.replace(/\{selected\.supplement\}/g, '{t(`${selected.id}.supplement`)}');

// Replace routes mapping
code = code.replace(/<span className="text-sm font-medium">\{route\.label\}<\/span>/g, '<span className="text-sm font-medium">{t(`labels.routes.${route.label.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")}`)}</span>');

fs.writeFileSync('src/app/games/page.tsx', code, 'utf8');
console.log('JSON and Page updated!');
