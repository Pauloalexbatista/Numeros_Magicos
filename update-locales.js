const fs = require('fs');

const data = {
  pt: {
    labels: {
      whereToPlay: 'Âmbito / Onde Jogar',
      started: 'Quando começou',
      drawDays: 'Dias de sorteio',
      format: 'Estrutura (Como se joga)',
      history: 'Breve Historial',
      about: 'Sobre',
      disclaimer: 'Aqui a análise não garante prémios: só registamos desempenho histórico de sistemas estatísticos sobre sorteios reais.',
      starsDisclaimer: 'No {game}, a componente suplementar tem comportamento diferente dos números principais. Estamos a separar rankings para comparação justa.',
      top5_main: 'TOP 5 SISTEMAS — NÚMEROS PRINCIPAIS',
      top5_stars: 'TOP 5 SISTEMAS — ESTRELAS / SUPLEMENTARES',
      quick_access: 'ACESSOS RÁPIDOS'
    },
    euromillions: {
      whereToPlay: 'Portugal, Espanha, França, Reino Unido, Irlanda, Áustria, Bélgica, Luxemburgo e Suíça.',
      started: '13 de fevereiro de 2004.',
      drawDays: 'Terças e Sextas-feiras à noite.',
      format: '5 números principais (1 a 50) + 2 Estrelas (1 a 12).',
      history: 'Nasceu para ser a grande lotaria transnacional europeia. O primeiro sorteio envolveu apenas França, Espanha e Reino Unido, mas Portugal e outros integraram-se logo em outubro de 2004. Inicialmente as estrelas iam até ao 9, alargadas progressivamente até ao 12.'
    },
    totoloto: {
      whereToPlay: 'Exclusivamente em Portugal.',
      started: '30 de março de 1985.',
      drawDays: 'Quartas e Sábados.',
      format: '5 números principais (1 a 49) + 1 Número da Sorte (1 a 13).',
      history: 'É o jogo de prognósticos numéricos mais antigo e tradicional de Portugal. Originalmente escolhiam-se 6 números. Em março de 2011 adotou o formato atual com o "Número da Sorte", permitindo acumular jackpots milionários.'
    },
    eurodreams: {
      whereToPlay: 'Portugal, Espanha, França, Irlanda, Bélgica, Áustria, Suíça e Luxemburgo.',
      started: '30 de outubro de 2023.',
      drawDays: 'Segundas e Quintas-feiras.',
      format: '6 números principais (1 a 40) + 1 Número de Sonho (1 a 5).',
      history: 'A mais recente adição aos jogos europeus. Ao contrário do Euromilhões que paga o prémio de uma vez, inovou ao focar-se em rendas mensais. O 1º prémio garante 20 mil euros por mês durante 30 anos.'
    },
    megasena: {
      whereToPlay: 'Exclusivamente no Brasil.',
      started: '11 de março de 1996.',
      drawDays: 'Terças, Quintas e Sábados.',
      format: 'De 6 a 20 números num volante com 60 opções (01 a 60).',
      history: 'Criada para substituir a antiga Trina, tornou-se na maior lotaria do Brasil. Além dos sorteios regulares, o jogo é célebre pela Mega da Virada no dia 31 de dezembro, que não acumula e distribui centenas de milhões de reais.'
    }
  },
  en: {
    labels: {
      whereToPlay: 'Where to Play',
      started: 'When it Started',
      drawDays: 'Draw Days',
      format: 'Key Structure',
      history: 'Brief History',
      about: 'About',
      disclaimer: 'Analysis does not guarantee prizes: we only record historical performance of statistical systems on real draws.',
      starsDisclaimer: 'In {game}, the supplementary component behaves differently from the main numbers. We separate rankings for fair comparison.',
      top5_main: 'TOP 5 SYSTEMS — MAIN NUMBERS',
      top5_stars: 'TOP 5 SYSTEMS — STARS / SUPPLEMENTARY',
      quick_access: 'QUICK ACCESS'
    },
    euromillions: {
      whereToPlay: 'Portugal, Spain, France, UK, Ireland, Austria, Belgium, Luxembourg and Switzerland.',
      started: 'February 13, 2004.',
      drawDays: 'Tuesday and Friday evenings.',
      format: '5 main numbers (1 to 50) + 2 Stars (1 to 12).',
      history: 'Born to be the great European transnational lottery. The first draw involved only France, Spain and the UK, but Portugal and others joined in October 2004. Initially stars went up to 9, progressively expanded to 12.'
    },
    totoloto: {
      whereToPlay: 'Exclusively in Portugal.',
      started: 'March 30, 1985.',
      drawDays: 'Wednesdays and Saturdays.',
      format: '5 main numbers (1 to 49) + 1 Lucky Number (1 to 13).',
      history: 'It is the oldest and most traditional lottery in Portugal. Originally you picked 6 numbers. In March 2011 it adopted the current format with the "Lucky Number", allowing millionaire jackpots to accumulate.'
    },
    eurodreams: {
      whereToPlay: 'Portugal, Spain, France, Ireland, Belgium, Austria, Switzerland and Luxembourg.',
      started: 'October 30, 2023.',
      drawDays: 'Mondays and Thursdays.',
      format: '6 main numbers (1 to 40) + 1 Dream Number (1 to 5).',
      history: 'The newest addition to European games. Unlike Euromillions which pays a lump sum, it innovated by focusing on monthly annuities. The 1st prize guarantees 20 thousand euros per month for 30 years.'
    },
    megasena: {
      whereToPlay: 'Exclusively in Brazil.',
      started: 'March 11, 1996.',
      drawDays: 'Tuesdays, Thursdays and Saturdays.',
      format: '6 to 20 numbers from a 60-option ticket (01 to 60).',
      history: 'Created to replace the old Trina, it became Brazil\'s largest lottery. Besides regular draws, it is famous for the "Mega da Virada" on December 31, which does not roll over and awards hundreds of millions of reais.'
    }
  },
  es: {
    labels: {
      whereToPlay: 'Dónde jugar',
      started: 'Cuándo empezó',
      drawDays: 'Días de sorteo',
      format: 'Estructura de clave',
      history: 'Breve Historia',
      about: 'Acerca de',
      disclaimer: 'El análisis no garantiza premios: solo registramos el rendimiento histórico de sistemas estadísticos en sorteos reales.',
      starsDisclaimer: 'En {game}, el componente suplementario se comporta diferente de los números principales. Separamos los rankings para una comparación justa.',
      top5_main: 'TOP 5 SISTEMAS — NÚMEROS PRINCIPALES',
      top5_stars: 'TOP 5 SISTEMAS — ESTRELLAS / SUPLEMENTARIOS',
      quick_access: 'ACCESOS RÁPIDOS'
    },
    euromillions: {
      whereToPlay: 'Portugal, España, Francia, Reino Unido, Irlanda, Austria, Bélgica, Luxemburgo y Suiza.',
      started: '13 de febrero de 2004.',
      drawDays: 'Martes y viernes por la noche.',
      format: '5 números principales (1 al 50) + 2 Estrellas (1 al 12).',
      history: 'Nació para ser la gran lotería transnacional europea. El primer sorteo involucró solo a Francia, España y Reino Unido, pero Portugal y otros se unieron en octubre de 2004. Inicialmente las estrellas llegaban al 9, expandidas progresivamente al 12.'
    },
    totoloto: {
      whereToPlay: 'Exclusivamente en Portugal.',
      started: '30 de marzo de 1985.',
      drawDays: 'Miércoles y sábados.',
      format: '5 números principales (1 al 49) + 1 Número de la Suerte (1 al 13).',
      history: 'Es la lotería más antigua y tradicional de Portugal. Originalmente se elegían 6 números. En marzo de 2011 adoptó el formato actual con el "Número de la Suerte", permitiendo acumular botes millonarios.'
    },
    eurodreams: {
      whereToPlay: 'Portugal, España, Francia, Irlanda, Bélgica, Austria, Suiza y Luxemburgo.',
      started: '30 de octubre de 2023.',
      drawDays: 'Lunes y jueves.',
      format: '6 números principales (1 al 40) + 1 Número de Sueño (1 al 5).',
      history: 'La última incorporación a los juegos europeos. A diferencia de Euromillones, innovó enfocándose en anualidades mensuales. El 1er premio garantiza 20 mil euros al mes durante 30 años.'
    },
    megasena: {
      whereToPlay: 'Exclusivamente en Brasil.',
      started: '11 de marzo de 1996.',
      drawDays: 'Martes, jueves y sábados.',
      format: '6 a 20 números de un boleto de 60 opciones (01 al 60).',
      history: 'Creada para reemplazar a la antigua Trina, se convirtió en la lotería más grande de Brasil. Además de los sorteos regulares, es famosa por la "Mega da Virada" el 31 de diciembre, que no se acumula.'
    }
  },
  fr: {
    labels: {
      whereToPlay: 'Où jouer',
      started: 'Quand ça a commencé',
      drawDays: 'Jours de tirage',
      format: 'Structure du jeu',
      history: 'Bref Historique',
      about: 'À propos de',
      disclaimer: 'L\'analyse ne garantit pas de prix: nous enregistrons uniquement les performances historiques des systèmes statistiques sur de vrais tirages.',
      starsDisclaimer: 'Dans {game}, le composant supplémentaire se comporte différemment des numéros principaux. Nous séparons les classements pour une comparaison équitable.',
      top5_main: 'TOP 5 SYSTÈMES — NUMÉROS PRINCIPAUX',
      top5_stars: 'TOP 5 SYSTÈMES — ÉTOILES / SUPPLÉMENTAIRES',
      quick_access: 'ACCÈS RAPIDE'
    },
    euromillions: {
      whereToPlay: 'Portugal, Espagne, France, Royaume-Uni, Irlande, Autriche, Belgique, Luxembourg et Suisse.',
      started: '13 février 2004.',
      drawDays: 'Mardi et vendredi soir.',
      format: '5 numéros principaux (1 à 50) + 2 Étoiles (1 à 12).',
      history: 'Né pour être la grande loterie transnationale européenne. Le premier tirage n\'impliquait que la France, l\'Espagne et le Royaume-Uni, mais le Portugal et d\'autres ont rejoint en octobre 2004. Initialement les étoiles allaient jusqu\'à 9, progressivement élargies à 12.'
    },
    totoloto: {
      whereToPlay: 'Exclusivement au Portugal.',
      started: '30 mars 1985.',
      drawDays: 'Mercredis et samedis.',
      format: '5 numéros principaux (1 à 49) + 1 Numéro Chance (1 à 13).',
      history: 'C\'est la loterie la plus ancienne et la plus traditionnelle du Portugal. À l\'origine, on choisissait 6 numéros. En mars 2011, il a adopté le format actuel avec le "Numéro Chance", permettant d\'accumuler des jackpots millionnaires.'
    },
    eurodreams: {
      whereToPlay: 'Portugal, Espagne, France, Irlande, Belgique, Autriche, Suisse et Luxembourg.',
      started: '30 octobre 2023.',
      drawDays: 'Lundis et jeudis.',
      format: '6 numéros principaux (1 à 40) + 1 Numéro Rêve (1 à 5).',
      history: 'Le dernier ajout aux jeux européens. Contrairement à l\'Euromillions, il a innové en se concentrant sur les rentes mensuelles. Le 1er prix garantit 20 mille euros par mois pendant 30 ans.'
    },
    megasena: {
      whereToPlay: 'Exclusivement au Brésil.',
      started: '11 mars 1996.',
      drawDays: 'Mardis, jeudis et samedis.',
      format: '6 à 20 numéros sur un bulletin de 60 options (01 à 60).',
      history: 'Créée pour remplacer l\'ancienne Trina, elle est devenue la plus grande loterie du Brésil. Outre les tirages réguliers, elle est célèbre pour la "Mega da Virada" du 31 décembre.'
    }
  }
};

const updateLocales = () => {
  ['pt', 'en', 'es', 'fr'].forEach(lang => {
    const p = `messages/${lang}.json`;
    if (fs.existsSync(p)) {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      j.games = data[lang];
      fs.writeFileSync(p, JSON.stringify(j, null, 2), 'utf8');
      console.log(`Updated ${lang}.json`);
    }
  });
};
updateLocales();
