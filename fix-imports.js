const fs = require('fs');

const files = [
    'src/components/dashboard/TopNumberSystemsWidget.tsx',
    'src/components/dashboard/TopStarSystemsWidget.tsx',
    'src/components/dashboard/HistoricalBestWidget.tsx',
    'src/components/dashboard/StarJackpotLeaders.tsx'
];

files.forEach(file => {
    if(fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Remove useTranslations from whatever wrong import it ended up in
        content = content.replace(/import \{ useTranslations,([^}]*)\} from '(?!next-intl)(.*?)';/g, "import {$1} from '$2';");
        
        // Ensure it's imported correctly from next-intl
        if (!content.includes("from 'next-intl'")) {
            content = "import { useTranslations } from 'next-intl';\n" + content;
        } else if (!content.includes("useTranslations") || (content.match(/useTranslations/g) || []).length < 2) { // 1 import, 1 usage
            if (!content.includes("import { useTranslations")) {
                content = content.replace(/import \{([^}]*)\} from 'next-intl';/g, "import { useTranslations,$1} from 'next-intl';");
            }
        }
        
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log("Imports fixed!");
