const fs = require('fs');
const ldFile = 'src/components/dashboard/LastDrawNumberSystems.tsx';
let ldContent = fs.readFileSync(ldFile, 'utf8');

ldContent = ldContent.replace("import { Trophy } from 'lucide-react';", "import { Trophy } from 'lucide-react';\nimport { useTranslations, useLocale } from 'next-intl';");

ldContent = ldContent.replace("export default function LastDrawNumberSystems({ game = GameType.EUROMILLIONS }: LastDrawNumberSystemsProps) {", "export default function LastDrawNumberSystems({ game = GameType.EUROMILLIONS }: LastDrawNumberSystemsProps) {\n    const t = useTranslations('dashboard');\n    const locale = useLocale();");

fs.writeFileSync(ldFile, ldContent, 'utf8');
console.log('LastDrawNumberSystems fixed imports');
