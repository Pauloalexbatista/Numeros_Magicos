const fs = require('fs');

// 1. Update JSON dictionaries
const langs = ['en', 'es', 'fr', 'pt'];
const dictAdditions = {
  en: { latest_draw: 'LATEST DRAW', prize: 'PRIZE', perfect: 'PERFECT!', jackpots: 'JACKPOTS!' },
  es: { latest_draw: 'ÚLTIMO SORTEO', prize: 'PREMIO', perfect: '¡PERFECTO!', jackpots: '¡Botes!' },
  fr: { latest_draw: 'DERNIER TIRAGE', prize: 'PRIX', perfect: 'PARFAIT !', jackpots: 'JACKPOTS !' },
  pt: { latest_draw: 'ÚLTIMO SORTEIO', prize: 'PRÉMIO', perfect: 'PERFEITO!', jackpots: 'JACKPOTS!' }
};

for (const lang of langs) {
  const file = `messages/${lang}.json`;
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data.dashboard.latest_draw) {
      data.dashboard = { ...data.dashboard, ...dictAdditions[lang] };
      fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    }
  }
}
console.log('Dictionaries updated');

// 2. Update MainNavigation.tsx
const navFile = 'src/components/MainNavigation.tsx';
let navContent = fs.readFileSync(navFile, 'utf8');

// Replace Lucide icons with flags
navContent = navContent.replace(/icon: Hash,[\s\S]*?accentVar/g, "icon: () => <img src=\"https://flagcdn.com/eu.svg\" alt=\"EU\" className=\"w-3.5 h-auto rounded-sm\" />, accentVar");
navContent = navContent.replace(/name: 'Totoloto',[\s\S]*?icon:.*?accentVar/, "name: 'Totoloto',\n    href: '/dashboard/totoloto',\n    icon: () => <img src=\"https://flagcdn.com/pt.svg\" alt=\"PT\" className=\"w-3.5 h-auto rounded-sm\" />,\n    accentVar");
navContent = navContent.replace(/name: 'EuroDreams',[\s\S]*?icon:.*?accentVar/, "name: 'EuroDreams',\n    href: '/dashboard/eurodreams',\n    icon: () => <img src=\"https://flagcdn.com/eu.svg\" alt=\"EU\" className=\"w-3.5 h-auto rounded-sm\" />,\n    accentVar");
navContent = navContent.replace(/name: 'Mega-Sena',[\s\S]*?icon:.*?accentVar/, "name: 'Mega-Sena',\n    href: '/dashboard/megasena',\n    icon: () => <img src=\"https://flagcdn.com/br.svg\" alt=\"BR\" className=\"w-3.5 h-auto rounded-sm\" />,\n    accentVar");

// Update Tools and How It Works to be icon only and colored by activeGame
navContent = navContent.replace(/<span className="hidden md:inline">\{t\("tools"\)\}<\/span>/g, "");
navContent = navContent.replace(/<span className="hidden md:inline">Como funciona<\/span>/g, "");

navContent = navContent.replace(/style=\{\{ color: isActive\('\/tools'\) \? 'var\(--accent\)' : 'var\(--text-tertiary\)' \}\}/g, "style={{ color: activeGame ? activeGame.accentVar : 'var(--text-tertiary)' }}");
navContent = navContent.replace(/style=\{\{ color: 'var\(--text-tertiary\)' \}\}/g, "style={{ color: activeGame ? activeGame.accentVar : 'var(--text-tertiary)' }}");

fs.writeFileSync(navFile, navContent, 'utf8');
console.log('MainNavigation updated');

// 3. Update LatestDrawWidget.tsx
const ldwFile = 'src/components/dashboard/LatestDrawWidget.tsx';
let ldwContent = fs.readFileSync(ldwFile, 'utf8');

if (!ldwContent.includes("useLocale")) {
  ldwContent = ldwContent.replace("import { useTranslations } from 'next-intl';", "import { useTranslations, useLocale } from 'next-intl';");
  ldwContent = ldwContent.replace("const t = useTranslations('dashboard');", "const t = useTranslations('dashboard');\n  const locale = useLocale();");
}

ldwContent = ldwContent.replace(/new Intl\.DateTimeFormat\('pt-PT',/g, "new Intl.DateTimeFormat(locale,");
ldwContent = ldwContent.replace(/Ultimo Sorteio/g, "{t('latest_draw')}");
ldwContent = ldwContent.replace(/ULTIMO SORTEIO/g, "{t('latest_draw')}");
ldwContent = ldwContent.replace(/PREMIO/g, "{t('prize')}");

fs.writeFileSync(ldwFile, ldwContent, 'utf8');
console.log('LatestDrawWidget updated');

// 4. Update LastDrawStarSystems.tsx
const ldsFile = 'src/components/dashboard/LastDrawStarSystems.tsx';
let ldsContent = fs.readFileSync(ldsFile, 'utf8');

if (!ldsContent.includes("useLocale")) {
  ldsContent = ldsContent.replace("import { useTranslations } from 'next-intl';", "import { useTranslations, useLocale } from 'next-intl';");
  ldsContent = ldsContent.replace("const t = useTranslations('dashboard');", "const t = useTranslations('dashboard');\n  const locale = useLocale();");
}
ldsContent = ldsContent.replace(/new Intl\.DateTimeFormat\('pt-PT',/g, "new Intl.DateTimeFormat(locale,");
ldsContent = ldsContent.replace(/PERFEITO!/g, "{t('perfect')}");
ldsContent = ldsContent.replace(/9 JACKPOTS!/g, "9 {t('jackpots')}");
ldsContent = ldsContent.replace(/Melhores Sistemas de Sonho em/g, "{t('top_stars')} -");

fs.writeFileSync(ldsFile, ldsContent, 'utf8');
console.log('LastDrawStarSystems updated');

// 5. Update LastDrawSystems.tsx
const ldFile = 'src/components/dashboard/LastDrawSystems.tsx';
let ldContent = fs.readFileSync(ldFile, 'utf8');

if (!ldContent.includes("useLocale")) {
  ldContent = ldContent.replace("import { useTranslations } from 'next-intl';", "import { useTranslations, useLocale } from 'next-intl';");
  ldContent = ldContent.replace("const t = useTranslations('dashboard');", "const t = useTranslations('dashboard');\n  const locale = useLocale();");
}
ldContent = ldContent.replace(/new Intl\.DateTimeFormat\('pt-PT',/g, "new Intl.DateTimeFormat(locale,");
ldContent = ldContent.replace(/Melhores Sistemas de Números em/g, "{t('top_numbers')} -");

fs.writeFileSync(ldFile, ldContent, 'utf8');
console.log('LastDrawSystems updated');

