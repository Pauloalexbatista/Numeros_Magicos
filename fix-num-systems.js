const fs = require('fs');
const ldFile = 'src/components/dashboard/LastDrawNumberSystems.tsx';
let ldContent = fs.readFileSync(ldFile, 'utf8');

if (!ldContent.includes("useLocale")) {
  ldContent = ldContent.replace("import { useTranslations } from 'next-intl';", "import { useTranslations, useLocale } from 'next-intl';");
  ldContent = ldContent.replace("const t = useTranslations('dashboard');", "const t = useTranslations('dashboard');\n  const locale = useLocale();");
}

ldContent = ldContent.replace(/new Intl\.DateTimeFormat\('pt-PT',/g, "new Intl.DateTimeFormat(locale,");

// Also replace the titles:
ldContent = ldContent.replace(/<span className="font-semibold text-sm">Melhores Sistemas de Números<\/span>/g, '<span className="font-semibold text-sm">{t("top_numbers")}</span>');
ldContent = ldContent.replace(/<span className="font-semibold text-sm">Melhores Sistemas de Números em/g, '<span className="font-semibold text-sm">{t("top_numbers")} -');
ldContent = ldContent.replace(/<span className="font-semibold text-sm">Melhores Sistemas de N.meros<\/span>/g, '<span className="font-semibold text-sm">{t("top_numbers")}</span>');
ldContent = ldContent.replace(/<span className="font-semibold text-sm">Melhores Sistemas de N.meros em/g, '<span className="font-semibold text-sm">{t("top_numbers")} -');


fs.writeFileSync(ldFile, ldContent, 'utf8');
console.log('LastDrawNumberSystems updated');
