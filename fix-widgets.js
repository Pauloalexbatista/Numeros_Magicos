const fs = require('fs');

const fixTranslation = (file, isStar, isJackpot) => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add useTranslations if not imported
    if (!content.includes("useTranslations(")) {
        content = content.replace(
            "import { useLocale } from 'next-intl';", 
            "import { useTranslations, useLocale } from 'next-intl';"
        );
        if(!content.includes("useTranslations")) {
            content = content.replace("import {", "import { useTranslations, ");
        }
    }
    
    // Inject hook
    if (!content.includes("const t = useTranslations('dashboard');")) {
        content = content.replace(
            /(export default function [a-zA-Z]+\([^)]*\)\s*{)/,
            "$1\n    const t = useTranslations('dashboard');"
        );
    }
    
    // Replace titles
    if (file.includes('TopNumberSystemsWidget')) {
        content = content.replace(/>Top Sistemas</g, '>{t("top_systems")}<');
        content = content.replace(/>Ver Ranking Completo</g, '>{t("view_full_ranking")}<');
    } else if (file.includes('TopStarSystemsWidget')) {
        content = content.replace(/>Top Número da Sorte</g, '>{t("top_star_systems")}<');
        content = content.replace(/>Top Estrelas</g, '>{t("top_star_systems")}<');
        content = content.replace(/>Ver Ranking Completo</g, '>{t("view_full_ranking")}<');
    } else if (file.includes('HistoricalBestWidget')) {
        content = content.replace(/>Reis do Jackpot</g, '>{t("jackpot_kings")}<');
        content = content.replace(/>Ver Ranking Completo</g, '>{t("view_full_ranking")}<');
    } else if (file.includes('StarJackpotLeaders')) {
        content = content.replace(/>Reis do Numero da Sorte</g, '>{t("star_kings")}<');
        content = content.replace(/>Reis das Estrelas</g, '>{t("star_kings")}<');
        content = content.replace(/>Ver Ranking Completo</g, '>{t("view_full_ranking")}<');
    }
    
    // Uniform badges: instead of bg-accent/20 text-accent, make it border border-accent text-accent or bg-accent text-white
    // Let's just make ALL of them bg-accent text-white so they are consistent!
    content = content.replace(/"bg-accent\/20 text-accent"/g, '"bg-accent text-white"');
    
    fs.writeFileSync(file, content, 'utf8');
};

fixTranslation('src/components/dashboard/TopNumberSystemsWidget.tsx');
fixTranslation('src/components/dashboard/TopStarSystemsWidget.tsx');
fixTranslation('src/components/dashboard/HistoricalBestWidget.tsx');
fixTranslation('src/components/dashboard/StarJackpotLeaders.tsx');
fixTranslation('src/components/dashboard/LastDrawNumberSystems.tsx');
fixTranslation('src/components/dashboard/LastDrawStarSystems.tsx');

// Also fix the hardcoded title in LastDrawStarSystems and LastDrawNumberSystems if any
let ldss = fs.readFileSync('src/components/dashboard/LastDrawStarSystems.tsx', 'utf8');
ldss = ldss.replace(/Melhores Sistemas de \{starLabel\}/g, '{t("best_star_systems")} {starLabel}');
ldss = ldss.replace(/"bg-accent\/20 text-accent"/g, '"bg-accent text-white"');
fs.writeFileSync('src/components/dashboard/LastDrawStarSystems.tsx', ldss, 'utf8');

let ldns = fs.readFileSync('src/components/dashboard/LastDrawNumberSystems.tsx', 'utf8');
ldns = ldns.replace(/"bg-accent\/20 text-accent"/g, '"bg-accent text-white"');
fs.writeFileSync('src/components/dashboard/LastDrawNumberSystems.tsx', ldns, 'utf8');

console.log("Fixed translations and badges in widgets!");
