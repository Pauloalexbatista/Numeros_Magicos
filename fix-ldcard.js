const fs = require('fs');
const file = 'src/components/dashboard/LatestDrawWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("export function LatestDrawCard({ latestDraw }: LatestDrawCardProps) {\n    if (!latestDraw) {", "export function LatestDrawCard({ latestDraw }: LatestDrawCardProps) {\n    const t = useTranslations('dashboard');\n    const locale = useLocale();\n    if (!latestDraw) {");
content = content.replace(/new Intl\.DateTimeFormat\('pt-PT',/g, "new Intl.DateTimeFormat(locale,");
content = content.replace(/\{new Date\(latestDraw\.date\)\.toLocaleDateString\('pt-PT',/g, "{new Date(latestDraw.date).toLocaleDateString(locale,");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed LatestDrawCard error');
