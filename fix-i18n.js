const fs = require('fs');

const pt = {
  "nav": {
    "euromillions": "Euromilhões",
    "totoloto": "Totoloto",
    "eurodreams": "EuroDreams",
    "megasena": "Mega-Sena",
    "dashboard": "Painel Principal",
    "ranking": "Ranking & Sistemas",
    "analysis": "Análises Avançadas",
    "tools": "Ferramentas Úteis",
    "logout": "Sair"
  },
  "login": {
    "stats_analysis": "Análise estatística",
    "last_draw": "Último Sorteio",
    "top_system": "Top Sistema Atual",
    "accuracy": "acerto",
    "draws_analyzed": "Sorteios Analisados",
    "ad_space": "Espaço publicitário",
    "ad_banner": "728 × 90 – Banner topo (em breve)",
    "access_data": "Acesso aos dados",
    "free": "Gratuito",
    "disclaimer_text": "Para continuares, confirma que compreendes que se trata apenas de análise estatística e que não existem garantias de ganhos.",
    "warning_text": "Aviso legal: O jogo pode ser viciante. Os dados apresentados são estritamente estatísticos, históricos e académicos, não garantindo quaisquer ganhos futuros. Jogue responsavelmente e com moderação. Mais informações em",
    "accept_checkbox": "Li, compreendi os riscos e aceito os termos descritos. Quero explorar os dados com responsabilidade.",
    "btn_enter": "Entrar e explorar os dados",
    "btn_confirm": "Confirma para continuar",
    "footer_info": "Acesso gratuito • Sem login • Apenas análise estatística",
    "latest_jackpots": "Últimos Jackpots Acertados"
  },
  "dashboard": {
    "subtitle": "Painel de Análise Estatística Avançada",
    "top_numbers": "Melhores Sistemas de Números",
    "top_stars": "Melhores Sistemas de Estrelas",
    "loading": "A carregar dados para",
    "latest_draw": "ÚLTIMO SORTEIO",
    "prize": "PRÉMIO",
    "perfect": "PERFEITO!",
    "jackpots": "JACKPOTS!"
  }
};

const fr = {
  "nav": {
    "euromillions": "EuroMillions",
    "totoloto": "Totoloto",
    "eurodreams": "EuroDreams",
    "megasena": "Mega-Sena",
    "dashboard": "Tableau de Bord",
    "ranking": "Classement & Systèmes",
    "analysis": "Analyse Avancée",
    "tools": "Outils Pratiques",
    "logout": "Déconnexion"
  },
  "login": {
    "stats_analysis": "Analyse statistique",
    "last_draw": "Dernier Tirage",
    "top_system": "Meilleur Système Actuel",
    "accuracy": "de réussite",
    "draws_analyzed": "Tirages Analysés",
    "ad_space": "Espace publicitaire",
    "ad_banner": "728 × 90 – Bannière supérieure (bientôt)",
    "access_data": "Accès aux données",
    "free": "Gratuit",
    "disclaimer_text": "Pour continuer, veuillez confirmer que vous comprenez qu'il s'agit uniquement d'une analyse statistique et qu'il n'y a aucune garantie de gain.",
    "warning_text": "Avertissement légal : Le jeu peut être addictif. Les données présentées sont strictement statistiques, historiques et académiques, et ne garantissent aucun gain futur. Jouez de manière responsable et avec modération. Plus d'informations sur",
    "accept_checkbox": "J'ai lu, compris les risques et j'accepte les conditions décrites. Je souhaite explorer les données de manière responsable.",
    "btn_enter": "Entrer et explorer les données",
    "btn_confirm": "Confirmer pour continuer",
    "footer_info": "Accès gratuit • Sans inscription • Uniquement analyse statistique",
    "latest_jackpots": "Derniers Jackpots Frappés"
  },
  "dashboard": {
    "subtitle": "Tableau de Bord d'Analyse Statistique Avancée",
    "top_numbers": "Meilleurs Systèmes de Numéros",
    "top_stars": "Meilleurs Systèmes d'Étoiles",
    "loading": "Chargement des données pour",
    "latest_draw": "DERNIER TIRAGE",
    "prize": "PRIX",
    "perfect": "PARFAIT !",
    "jackpots": "JACKPOTS !"
  }
};

fs.writeFileSync('messages/pt.json', JSON.stringify(pt, null, 2), 'utf8');
fs.writeFileSync('messages/fr.json', JSON.stringify(fr, null, 2), 'utf8');
console.log('Translations fixed');
