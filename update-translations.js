const fs = require('fs');

const keysToAdd = {
    "pt": {
        "top_systems": "Top Sistemas",
        "top_star_systems": "Top Sistemas Estrelas",
        "jackpot_kings": "Reis do Jackpot",
        "star_kings": "Reis das Estrelas",
        "view_full_ranking": "Ver Ranking Completo",
        "best_star_systems": "Melhores Sistemas de "
    },
    "pt-PT": {
        "top_systems": "Top Sistemas",
        "top_star_systems": "Top Sistemas Estrelas",
        "jackpot_kings": "Reis do Jackpot",
        "star_kings": "Reis das Estrelas",
        "view_full_ranking": "Ver Ranking Completo",
        "best_star_systems": "Melhores Sistemas de "
    },
    "en": {
        "top_systems": "Top Systems",
        "top_star_systems": "Top Star Systems",
        "jackpot_kings": "Jackpot Kings",
        "star_kings": "Star Kings",
        "view_full_ranking": "View Full Ranking",
        "best_star_systems": "Best Systems for "
    },
    "es": {
        "top_systems": "Top Sistemas",
        "top_star_systems": "Top Sistemas de Estrellas",
        "jackpot_kings": "Reyes del Jackpot",
        "star_kings": "Reyes de las Estrellas",
        "view_full_ranking": "Ver Ranking Completo",
        "best_star_systems": "Mejores Sistemas de "
    },
    "fr": {
        "top_systems": "Top Systèmes",
        "top_star_systems": "Top Systèmes d'Étoiles",
        "jackpot_kings": "Rois du Jackpot",
        "star_kings": "Rois des Étoiles",
        "view_full_ranking": "Voir le Classement Complet",
        "best_star_systems": "Meilleurs Systèmes de "
    }
};

const dir = 'messages/';
const files = fs.readdirSync(dir);

files.forEach(file => {
    if(file.endsWith('.json')) {
        const lang = file.replace('.json', '');
        if (keysToAdd[lang]) {
            const data = JSON.parse(fs.readFileSync(dir + file, 'utf8'));
            if (!data.dashboard) data.dashboard = {};
            Object.assign(data.dashboard, keysToAdd[lang]);
            fs.writeFileSync(dir + file, JSON.stringify(data, null, 2));
            console.log("Updated " + file);
        }
    }
});
