const fs = require('fs');

let code = fs.readFileSync('src/app/games/page.tsx', 'utf8');

// Fix Quick Access
code = code.replace(/ACESSOS<br \/>RÁPIDOS/g, '{t("labels.quick_access").split(" ")[0]}<br />{t("labels.quick_access").split(" ")[1]}');
code = code.replace(/ACESSOS RÁPIDOS/g, '{t("labels.quick_access")}');

// Fix Top 5 Systems Labels
code = code.replace(/TOP 5 SISTEMAS — NÚMEROS PRINCIPAIS/gi, '{t("labels.top5_main")}');
code = code.replace(/TOP 5 SISTEMAS — ESTRELAS \/ SUPLEMENTARES/gi, '{t("labels.top5_stars")}');

// Fix Disclaimer block (which is outside the About block)
// The right side disclaimer: "As análises são puramente estatísticas e não garantem ganhos. Jogue com responsabilidade."
code = code.replace(/As análises são puramente estatísticas e não garantem ganhos\. Jogue com responsabilidade\./g, '{t("labels.rightDisclaimer")}');

// Fix missing labels in the 5 boxes
code = code.replace(/<div className="text-\[11px\] font-medium text-muted-foreground mb-1">Números<\/div>/g, '<div className="text-[11px] font-medium text-muted-foreground mb-1">{t("labels.numbers")}</div>');
code = code.replace(/<div className="text-\[11px\] font-medium text-muted-foreground mb-1">Suplementar<\/div>/g, '<div className="text-[11px] font-medium text-muted-foreground mb-1">{t("labels.supplement")}</div>');

// Fix "ANÁLISE ESTATÍSTICA"
code = code.replace(/ANÁLISE ESTATÍSTICA/g, '{t("labels.stats_analysis")}');

fs.writeFileSync('src/app/games/page.tsx', code, 'utf8');
console.log('Fixed hardcoded text');
