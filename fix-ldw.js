const fs = require('fs');
const ldwFile = 'src/components/dashboard/LatestDrawWidget.tsx';
let ldwContent = fs.readFileSync(ldwFile, 'utf8');

ldwContent = ldwContent.replace("import React from 'react';", "import React from 'react';\nimport { useTranslations, useLocale } from 'next-intl';");

ldwContent = ldwContent.replace("export default function LatestDrawWidget({ latestDraw, game = GameType.EUROMILLIONS }: LatestDrawWidgetProps) {\n    if (!latestDraw) return null;", "export default function LatestDrawWidget({ latestDraw, game = GameType.EUROMILLIONS }: LatestDrawWidgetProps) {\n    const t = useTranslations('dashboard');\n    const locale = useLocale();\n    if (!latestDraw) return null;");

fs.writeFileSync(ldwFile, ldwContent, 'utf8');
console.log('Fixed LatestDrawWidget error');
