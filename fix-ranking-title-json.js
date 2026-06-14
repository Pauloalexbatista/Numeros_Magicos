const fs = require('fs');

const langs = ['en', 'es', 'fr', 'pt'];
const titles = {
  en: "Systems Ranking",
  es: "Ranking de Sistemas",
  fr: "Classement des Systèmes",
  pt: "Ranking de Sistemas"
};

for (const lang of langs) {
  const file = `messages/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  if (!data.ranking) {
    data.ranking = {};
  }
  
  data.ranking.title = titles[lang];
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

console.log("Added ranking.title to all translation files.");
