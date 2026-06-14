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

// 3. Replace all simple labels
code = code.replace(/<div className="text-\[11px\] font-medium text-muted-foreground mb-1">Formato<\/div>/g, '<div className="text-[11px] font-medium text-muted-foreground mb-1">{t("labels.format")}</div>');
code = code.replace(/<div className="text-\[11px\] font-medium text-muted-foreground mb-1">N(ú|\\u01f5)meros<\/div>/g, '<div className="text-[11px] font-medium text-muted-foreground mb-1">{t("labels.numbers")}</div>');
code = code.replace(/<div className="text-\[11px\] font-medium text-muted-foreground mb-1">Suplementar<\/div>/g, '<div className="text-[11px] font-medium text-muted-foreground mb-1">{t("labels.supplement")}</div>');
code = code.replace(/<div className="text-\[11px\] font-medium text-muted-foreground mb-1">(\'|Â)mbito<\/div>/g, '<div className="text-[11px] font-medium text-muted-foreground mb-1">{t("labels.whereToPlay")}</div>');
code = code.replace(/<div className="text-\[11px\] font-medium text-muted-foreground mb-1">Sorteios<\/div>/g, '<div className="text-[11px] font-medium text-muted-foreground mb-1">{t("labels.drawDays")}</div>');

// 4. Replace the values with translated values
code = code.replace(/\{selected\.format\}/g, '{t(`${selected.id}.format`)}');
code = code.replace(/\{selected\.scope\}/g, '{t(`${selected.id}.whereToPlay`)}');
code = code.replace(/\{selected\.drawDays\}/g, '{t(`${selected.id}.drawDays`)}');
code = code.replace(/\{selected\.numbers\}/g, '{t(`${selected.id}.numbers`)}');
code = code.replace(/\{selected\.supplement\}/g, '{t(`${selected.id}.supplement`)}');

// 5. Replace "Sobre" section
const oldSobre = /<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Sobre \{selected\.title\}<\/p>[\s\S]*?<\/p>/;
const newSobre = `<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{t("labels.about")} {selected.title}</p>
                <p className="text-sm text-secondary leading-relaxed">
                  {t(\`\${selected.id}.history\`)}
                  <br /><br />
                  <span className="text-xs text-muted-foreground opacity-80">{t("labels.disclaimer")}</span>
                </p>`;
code = code.replace(oldSobre, newSobre);

// 6. Fix "ANÁLISE ESTATÍSTICA"
code = code.replace(/ANÁLISE ESTATÍSTICA/g, '{t("labels.stats_analysis")}');
code = code.replace(/AN(Á|\\u00c1)LISE ESTAT(Í|\\u00cd)STICA/g, '{t("labels.stats_analysis")}');

// 7. Fix "Top 5 sistemas" labels (matching exactly what is in the file)
code = code.replace(/Top 5 sistemas [—\?"\-]+ n(ú|\\u01f5)meros principais/gi, '{t("labels.top5_main")}');
code = code.replace(/Top 5 sistemas [—\?"\-]+ estrelas \/ suplementares/gi, '{t("labels.top5_stars")}');
code = code.replace(/TOP 5 SISTEMAS — NÚMEROS PRINCIPAIS/gi, '{t("labels.top5_main")}');
code = code.replace(/TOP 5 SISTEMAS — ESTRELAS \/ SUPLEMENTARES/gi, '{t("labels.top5_stars")}');

// 8. Replace disclaimer for stars
code = code.replace(/<div className="rounded-xl border border-dashed border-border\/70 bg-surface-2\/40 px-3 py-4 text-xs text-muted-foreground">[\s\S]*?<\/div>/g, 
  `<div className="rounded-xl border border-dashed border-border/70 bg-surface-2/40 px-3 py-4 text-xs text-muted-foreground">\n                        {t("labels.starsDisclaimer", { game: selected.title })}\n                      </div>`);

// 9. Fix "Acessos Rápidos"
code = code.replace(/ACESSOS<br \/>R(Á|\?)PIDOS/g, '{t("labels.quick_access").split(" ")[0]}<br />{t("labels.quick_access").split(" ")[1]}');
code = code.replace(/ACESSOS R(Á|\?)PIDOS/g, '{t("labels.quick_access")}');
code = code.replace(/<span className="text-sm font-medium">\{route\.label\}<\/span>/g, '<span className="text-sm font-medium">{t(`labels.routes.${route.label.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")}`)}</span>');

// 10. Fix right disclaimer block
code = code.replace(/As análises são puramente estatísticas e não garantem ganhos\. Jogue com responsabilidade\./g, '{t("labels.rightDisclaimer")}');

// 11. Conditionally render the right box and span the left box
// Splitting by '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">'
let gridParts = code.split('<div className="grid grid-cols-1 md:grid-cols-2 gap-4">');
if (gridParts.length > 1) {
  let gridContent = gridParts[1];
  
  // Split grid content into the two boxes. 
  // We look for '<div className="rounded-2xl border border-border/70 bg-surface-1/60 p-5 shadow-sm">'
  const boxClass = '<div className="rounded-2xl border border-border/70 bg-surface-1/60 p-5 shadow-sm">';
  let boxParts = gridContent.split(boxClass);
  
  if (boxParts.length === 3) {
    // boxParts[0] is empty space
    // boxParts[1] is the first box content (up to the start of the second box)
    // boxParts[2] is the second box content (up to the end of the grid, or further)
    
    // Replace the first box start with conditional col-span
    let newFirstBoxStart = `<div className={\`rounded-2xl border border-border/70 bg-surface-1/60 p-5 shadow-sm \${selected.id === 'megasena' ? 'md:col-span-2' : ''}\`}>`;
    
    // For the second box, wrap it in a conditional
    // We must find the end of the grid. 
    // The grid closes right before: <div className="rounded-2xl border border-dashed border-border/70 bg-surface-1/40 px-4 py-3 flex items-center justify-between">
    let adBannerSplit = boxParts[2].split('<div className="rounded-2xl border border-dashed border-border/70 bg-surface-1/40 px-4 py-3 flex items-center justify-between">');
    
    if (adBannerSplit.length > 1) {
      // The second box ends inside adBannerSplit[0]. It ends with `</div>` (which closes the box) followed by `</div>` (which closes the grid).
      // We will wrap the second box with {selected.id !== 'megasena' && ( ... )}
      
      // Look for the last </div> before the ad banner
      let secondBoxContent = adBannerSplit[0];
      let lastDivIndex = secondBoxContent.lastIndexOf('</div>');
      
      if (lastDivIndex !== -1) {
        // We will insert `)}` right before the LAST `</div>` (which closes the grid).
        // Wait, the `</div>` that closes the second box is before the `</div>` that closes the grid.
        // Let's just put `)}` before the last `</div>`
        let beforeLastDiv = secondBoxContent.substring(0, lastDivIndex);
        let afterLastDiv = secondBoxContent.substring(lastDivIndex);
        
        adBannerSplit[0] = beforeLastDiv + '  )}\n            ' + afterLastDiv;
        
        let newSecondBoxStart = `{selected.id !== 'megasena' && (\n              <div className="rounded-2xl border border-border/70 bg-surface-1/60 p-5 shadow-sm">`;
        
        gridParts[1] = boxParts[0] + newFirstBoxStart + boxParts[1] + newSecondBoxStart + adBannerSplit.join('<div className="rounded-2xl border border-dashed border-border/70 bg-surface-1/40 px-4 py-3 flex items-center justify-between">');
      }
    }
  }
  
  code = gridParts.join('<div className="grid grid-cols-1 md:grid-cols-2 gap-4">');
}

fs.writeFileSync('src/app/games/page.tsx', code, 'utf8');
console.log('Fixed page.tsx!');
