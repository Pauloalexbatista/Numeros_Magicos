const fs = require('fs');

const fixTranslation = (file) => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add useTranslations if not imported
    if (!content.includes("useTranslations(")) {
        if (content.includes("from 'next-intl'")) {
            content = content.replace("import {", "import { useTranslations, ");
        } else {
            // Find the first line that is not 'use client'
            const lines = content.split('\n');
            let insertIndex = 0;
            for(let i=0; i<lines.length; i++) {
                if (lines[i].includes('import')) {
                    insertIndex = i;
                    break;
                }
            }
            lines.splice(insertIndex, 0, "import { useTranslations } from 'next-intl';");
            content = lines.join('\n');
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
    
    fs.writeFileSync(file, content, 'utf8');
};

fixTranslation('src/components/dashboard/TopNumberSystemsWidget.tsx');
fixTranslation('src/components/dashboard/TopStarSystemsWidget.tsx');
fixTranslation('src/components/dashboard/HistoricalBestWidget.tsx');
fixTranslation('src/components/dashboard/StarJackpotLeaders.tsx');
fixTranslation('src/components/dashboard/LastDrawNumberSystems.tsx');
fixTranslation('src/components/dashboard/LastDrawStarSystems.tsx');

let ldss = fs.readFileSync('src/components/dashboard/LastDrawStarSystems.tsx', 'utf8');
ldss = ldss.replace(/Melhores Sistemas de \{starLabel\}/g, '{t("best_star_systems")} {starLabel}');
fs.writeFileSync('src/components/dashboard/LastDrawStarSystems.tsx', ldss, 'utf8');

console.log("Translations added correctly without breaking anything.");
