const fs = require('fs');
const path = require('path');

const file = 'src/app/ranking/[game]/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace card styling in gameThemeMap
content = content.replace(
  /card: "bg-card\/50 backdrop-blur-sm border border-border backdrop-blur-md shadow-sm"/g,
  'card: "glass-card"'
);

// 2. Change the main wrapper to include style={{ backgroundColor }}
content = content.replace(
  /<div className=\{`min-h-screen text-foreground p-4 sm:p-6 pb-24 font-sans transition-all duration-500 \$\{currentTheme\.bg\}`\}>/g,
  '<div className={`min-h-screen text-foreground p-4 sm:p-6 pb-24 font-sans transition-all duration-500 game-page-${gameConfig?.slug}`} style={{ backgroundColor: "var(--" + (gameConfig?.slug === "euromillions" ? "euro" : gameConfig?.slug === "totoloto" ? "toto" : gameConfig?.slug === "eurodreams" ? "dream" : "mega") + "-bg)" }}>'
);
// But wait, the main wrapper might not be exactly that. Let me replace the entire main wrapper div.
// Let's use regex to find `<div className={\`min-h-screen text-foreground` ... >`
content = content.replace(
  /<div className=\{`min-h-screen text-foreground[^>]+>/,
  '<div className={`min-h-screen text-foreground p-4 sm:p-6 pb-24 font-sans transition-all duration-500 relative game-page-${gameConfig?.slug}`} style={{ backgroundColor: "var(--" + (gameConfig?.slug === "euromillions" ? "euro" : gameConfig?.slug === "totoloto" ? "toto" : gameConfig?.slug === "eurodreams" ? "dream" : "mega") + "-bg)", "--glow": "color-mix(in srgb, " + gameConfig?.ui.accent + " 20%, transparent)" }}>'
);

// 3. Import GAMES and gameConfig
if (!content.includes('const gameConfig = GAMES[gameType];')) {
  content = content.replace(
    /const currentTheme = gameThemeMap\[gameType\] \|\| gameThemeMap\[GameType\.EUROMILLIONS\];/g,
    `const currentTheme = gameThemeMap[gameType] || gameThemeMap[GameType.EUROMILLIONS];
    const gameConfig = GAMES[gameType];`
  );
}

// 4. Also replace `<Card className={\`bg-card\/50 backdrop-blur-sm border border-border shadow-sm overflow-hidden rounded-2xl\`}>` with `<Card className="glass-card overflow-hidden rounded-2xl">`
content = content.replace(
  /<Card className=\{`bg-card\/50 backdrop-blur-sm border border-border shadow-sm overflow-hidden rounded-2xl`\}>/g,
  '<Card className="glass-card overflow-hidden rounded-2xl">'
);

fs.writeFileSync(file, content);
console.log('Fixed system ranking page');
