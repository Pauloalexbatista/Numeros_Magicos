const fs = require('fs');

const files = [
    'src/components/dashboard/TopNumberSystemsWidget.tsx',
    'src/components/dashboard/TopStarSystemsWidget.tsx',
    'src/components/dashboard/HistoricalBestWidget.tsx',
    'src/components/dashboard/StarJackpotLeaders.tsx',
    'src/components/dashboard/LastDrawNumberSystems.tsx',
    'src/components/dashboard/LastDrawStarSystems.tsx'
];

files.forEach(file => {
    if(fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Find if use client is there
        if (content.includes("'use client';")) {
            // Remove it from wherever it is
            content = content.replace(/'use client';[\r\n]*/g, '');
            // Prepend it to the top
            content = "'use client';\n" + content;
        }
        
        // Also the user said "não pedi para alterar agora isso - já estava bem"
        // Meaning I should revert the badge styling change I made earlier.
        // My previous script did: content = content.replace(/"bg-accent\/20 text-accent"/g, '"bg-accent text-white"');
        // I will revert it:
        content = content.replace(/"bg-accent text-white"/g, '"bg-accent/20 text-accent"');
        
        // But wait! If I revert ALL "bg-accent text-white", it might revert the ones that were ORIGINALLY bg-accent text-white!
        // To be safe, I should git checkout these files, and then ONLY apply the translation fix carefully.
    }
});
console.log("Checking out files...");
