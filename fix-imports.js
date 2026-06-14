const fs = require('fs');
const pageFile = 'src/app/dashboard/[game]/page.tsx';
if (fs.existsSync(pageFile)) {
    let content = fs.readFileSync(pageFile, 'utf8');
    
    // Remove the bad Hash imports
    content = content.replace(/import \{ Hash, /g, 'import { ');
    
    // Add Hash and Star correctly from lucide-react
    if (!content.includes("import { Hash")) {
        content = content.replace(/import \{ Star \} from 'lucide-react';/g, "import { Star, Hash } from 'lucide-react';");
    }
    
    if (!content.includes("lucide-react")) {
        content = "import { Star, Hash } from 'lucide-react';\n" + content;
    }
    
    fs.writeFileSync(pageFile, content, 'utf8');
}
console.log("Fixed page.tsx imports");
