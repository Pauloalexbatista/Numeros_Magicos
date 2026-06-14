const fs = require('fs');

const updateFile = (path, newKeys) => {
  if (fs.existsSync(path)) {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (!data.login) data.login = {};
    for (const [k, v] of Object.entries(newKeys)) {
      data.login[k] = v;
    }
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${path}`);
  }
};

updateFile('messages/en.json', {
  "stats_analysis": "Statistical analysis",
  "latest_jackpots": "Latest Jackpots Hit"
});

updateFile('messages/es.json', {
  "stats_analysis": "Análisis estadístico",
  "latest_jackpots": "Últimos Jackpots Acertados"
});
