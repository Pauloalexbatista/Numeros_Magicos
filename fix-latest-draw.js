const fs = require('fs');
const file = 'src/components/dashboard/LatestDrawWidget.tsx';
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Change <h2 className="..."> to <div className="text-xs ...">
    content = content.replace(
        /<h2 className="text-\[10px\] font-bold uppercase tracking-wider text-muted-foreground">\{t\('latest_draw'\)\}<\/h2>/g,
        '<div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("latest_draw")}</div>'
    );
    
    // Change <p className="text-xl ..."> to <div className="text-lg ...">
    content = content.replace(
        /<p className="text-xl font-bold capitalize leading-none text-foreground" suppressHydrationWarning>/g,
        '<div className="text-lg font-bold capitalize leading-tight text-foreground mt-1" suppressHydrationWarning>'
    );
    content = content.replace(/<\/p>/g, '</div>');

    fs.writeFileSync(file, content, 'utf8');
}
console.log("Updated LatestDrawWidget sizes");
