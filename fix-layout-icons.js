const fs = require('fs');

// 1. Fix page.tsx spacing and icons
const pageFile = 'src/app/dashboard/[game]/page.tsx';
if (fs.existsSync(pageFile)) {
    let content = fs.readFileSync(pageFile, 'utf8');
    
    // Replace right column space-y-6 with space-y-4
    content = content.replace(/<div className="space-y-6">\s*<h2/g, '<div className="space-y-4">\n                        <h2');
    
    // Make sure Hash and Star are imported
    if (!content.includes('import { Hash')) {
        content = content.replace(/import { Star } from 'lucide-react';/g, "import { Star, Hash } from 'lucide-react';");
    }
    if (!content.includes("import { Star, Hash }") && !content.includes("import { Hash, Star }")) {
        content = content.replace(/import { /g, "import { Hash, ");
    }
    
    // Left column h2
    content = content.replace(
        /<h2 className="flex items-center gap-2 text-xl font-bold text-foreground">\s*\?\?\s*\{t\("top_numbers"\)\}\s*<\/h2>/g,
        '<h2 className="flex items-center gap-2 text-xl font-bold text-foreground">\n                            <Hash className="w-6 h-6 text-[var(--accent)]" />\n                            {t("top_numbers")}\n                        </h2>'
    );
    
    // Right column h2
    content = content.replace(
        /<h2 className="text-xl font-bold text-foreground flex items-center gap-2">\s*\?\s*\{t\("top_stars"\)\}\s*<\/h2>/g,
        '<h2 className="flex items-center gap-2 text-xl font-bold text-foreground">\n                            <Star className="w-6 h-6 text-[var(--accent)]" />\n                            {t("top_stars")}\n                        </h2>'
    );

    // Some older variations of the emoji
    content = content.replace(
        /(\uD83D\uDD22|🔢|\?\?)\s*\{t\("top_numbers"\)\}/g,
        '<Hash className="w-6 h-6 text-[var(--accent)]" />\n                            {t("top_numbers")}'
    );
    content = content.replace(
        /(\u2B50|\u2608|⭐|\?)\s*\{t\("top_stars"\)\}/g,
        '<Star className="w-6 h-6 text-[var(--accent)]" />\n                            {t("top_stars")}'
    );
    content = content.replace(/<Star className="w-6 h-6 text-yellow-500" \/>/g, '<Star className="w-6 h-6 text-[var(--accent)]" />');
    
    fs.writeFileSync(pageFile, content, 'utf8');
}

// 2. Fix LatestDrawWidget title size
const latestDrawFile = 'src/components/dashboard/LatestDrawWidget.tsx';
if (fs.existsSync(latestDrawFile)) {
    let content = fs.readFileSync(latestDrawFile, 'utf8');
    content = content.replace(
        /<h2 className="text-2xl font-black uppercase tracking-tight text-foreground">\{t\("latest_draw"\)\}<\/h2>\s*<p className="text-sm font-semibold capitalize text-muted-foreground"/g,
        '<h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("latest_draw")}</h2>\n                          <p className="text-xl font-bold capitalize leading-none text-foreground"'
    );
    fs.writeFileSync(latestDrawFile, content, 'utf8');
}

// 3. Fix HistoricalBestWidget empty states
const hbwFile = 'src/components/dashboard/HistoricalBestWidget.tsx';
if (fs.existsSync(hbwFile)) {
    let content = fs.readFileSync(hbwFile, 'utf8');
    
    // import Trophy if needed
    if (!content.includes('Trophy')) {
        content = content.replace(/import \{ formatSystemName/g, "import { Trophy } from 'lucide-react';\nimport { formatSystemName");
    }

    content = content.replace(
        /\{leaders\.map\(\(leader, index\)/g,
        '{leaders.filter(l => l.jackpots > 0).length === 0 ? (\n                          <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">\n                              <Trophy className="mb-2 h-8 w-8 text-muted-foreground" />\n                              <p className="text-xs text-muted-foreground">A aguardar sucessos históricos...</p>\n                          </div>\n                      ) : leaders.filter(l => l.jackpots > 0).map((leader, index)'
    );
    
    fs.writeFileSync(hbwFile, content, 'utf8');
}

// 4. Fix StarJackpotLeaders empty states
const sjlFile = 'src/components/dashboard/StarJackpotLeaders.tsx';
if (fs.existsSync(sjlFile)) {
    let content = fs.readFileSync(sjlFile, 'utf8');
    
    // import Star if needed
    if (!content.includes("import { Star")) {
        content = content.replace(/import \{ formatSystemName/g, "import { Star } from 'lucide-react';\nimport { formatSystemName");
    }

    content = content.replace(
        /\{leaders\.map\(\(leader, index\)/g,
        '{leaders.filter(l => l.jackpots > 0).length === 0 ? (\n                          <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">\n                              <Star className="mb-2 h-8 w-8 text-muted-foreground" />\n                              <p className="text-xs text-muted-foreground">A aguardar sucessos históricos...</p>\n                          </div>\n                      ) : leaders.filter(l => l.jackpots > 0).map((leader, index)'
    );
    
    fs.writeFileSync(sjlFile, content, 'utf8');
}

console.log("Applied visual and layout fixes");
