const fs = require('fs');
let code = fs.readFileSync('src/app/login/page.tsx', 'utf8');
code = code.replace(/\{gameConfig\.label\}\s*\{t\("stats_analysis"\)\}/g, '{gameConfig.label} • {t("stats_analysis")}');
fs.writeFileSync('src/app/login/page.tsx', code, 'utf8');
