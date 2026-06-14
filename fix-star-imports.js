const fs = require('fs');
const ldsFile = 'src/components/dashboard/LastDrawStarSystems.tsx';
let ldsContent = fs.readFileSync(ldsFile, 'utf8');

ldsContent = ldsContent.replace("import { Star, Trophy, Minus } from 'lucide-react';", "import { Star, Trophy, Minus } from 'lucide-react';\nimport { useTranslations, useLocale } from 'next-intl';");

ldsContent = ldsContent.replace("export default function LastDrawStarSystems({ game = GameType.EUROMILLIONS }: LastDrawStarSystemsProps) {", "export default function LastDrawStarSystems({ game = GameType.EUROMILLIONS }: LastDrawStarSystemsProps) {\n    const t = useTranslations('dashboard');\n    const locale = useLocale();");

fs.writeFileSync(ldsFile, ldsContent, 'utf8');
console.log('LastDrawStarSystems fixed imports');
