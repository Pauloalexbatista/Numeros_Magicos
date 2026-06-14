const fs = require('fs');

let code = fs.readFileSync('src/app/games/page.tsx', 'utf8');

// 1. Add import for useTranslations
if (!code.includes("import { useTranslations }")) {
  code = code.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport { useTranslations } from 'next-intl';");
}

// 2. Add const t = useTranslations('games'); inside the component
if (!code.includes("const t = useTranslations('games');")) {
  code = code.replace("export default function GamesPage() {", "export default function GamesPage() {\n  const t = useTranslations('games');");
}

// 3. Replace the labels
code = code.replace(/<div className="text-\[11px\] font-medium text-muted-foreground mb-1">Formato<\/div>/g, '<div className="text-[11px] font-medium text-muted-foreground mb-1">{t("labels.format")}</div>');
code = code.replace(/<div className="text-\[11px\] font-medium text-muted-foreground mb-1">N\u01f5meros<\/div>/g, '<div className="text-[11px] font-medium text-muted-foreground mb-1">Números</div>');
code = code.replace(/<div className="text-\[11px\] font-medium text-muted-foreground mb-1">Suplementar<\/div>/g, '<div className="text-[11px] font-medium text-muted-foreground mb-1">Suplementar</div>');
code = code.replace(/<div className="text-\[11px\] font-medium text-muted-foreground mb-1">\'mbito<\/div>/g, '<div className="text-[11px] font-medium text-muted-foreground mb-1">{t("labels.whereToPlay")}</div>');
code = code.replace(/<div className="text-\[11px\] font-medium text-muted-foreground mb-1">Sorteios<\/div>/g, '<div className="text-[11px] font-medium text-muted-foreground mb-1">{t("labels.drawDays")}</div>');

// 4. Replace the values with translated values
code = code.replace(/\{selected\.format\}/g, '{t(`${selected.id}.format`)}');
code = code.replace(/\{selected\.scope\}/g, '{t(`${selected.id}.whereToPlay`)}');
code = code.replace(/\{selected\.drawDays\}/g, '{t(`${selected.id}.drawDays`)}');

// 5. Replace "Sobre" section
const oldSobre = /<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Sobre \{selected\.title\}<\/p>[\s\S]*?<\/p>/;
const newSobre = `<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{t("labels.about")} {selected.title}</p>
                <p className="text-sm text-secondary leading-relaxed">
                  {t(\`\${selected.id}.history\`)}
                  <br /><br />
                  <span className="text-xs text-muted-foreground opacity-80">{t("labels.disclaimer")}</span>
                </p>`;
code = code.replace(oldSobre, newSobre);

// 6. Replace "Top 5 sistemas" labels
code = code.replace(/Top 5 sistemas \?" nǧmeros principais/g, '{t("labels.top5_main")}');
code = code.replace(/Top 5 sistemas \?" estrelas \/ suplementares/g, '{t("labels.top5_stars")}');

// 7. Replace disclaimer for stars
const oldStarDisclaimer = /Em \{selected\.title\}, a componente suplementar\/estrelas tem comportamento diferente dos nǧmeros principais\. Estamos a separar rankings para compara\u01dco justa\./;
code = code.replace(oldStarDisclaimer, '{t("labels.starsDisclaimer", { game: selected.title })}');

// 8. Replace "Acessos Rápidos"
code = code.replace(/ACESSOS<br \/>R\?PIDOS/g, '{t("labels.quick_access").split(" ")[0]}<br />{t("labels.quick_access").split(" ")[1]}');
// Just to be safe if it's rendered as one line:
code = code.replace(/ACESSOS R\?PIDOS/g, '{t("labels.quick_access")}');

fs.writeFileSync('src/app/games/page.tsx', code, 'utf8');
console.log('Page updated!');
