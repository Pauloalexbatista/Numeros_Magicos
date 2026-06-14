const fs = require('fs');
const ldssFile = 'src/components/dashboard/LastDrawStarSystems.tsx';
if (fs.existsSync(ldssFile)) {
    let content = fs.readFileSync(ldssFile, 'utf8');
    
    // Change outer padding of row
    content = content.replace(/p-3 rounded-lg/g, 'px-3 py-2 rounded-lg');
    
    // Change the pill styling
    content = content.replace(/h-8 px-3 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm min-w-\[3\.5rem\]/g, 'h-7 px-2 flex items-center justify-center rounded-lg text-xs font-bold shadow-sm min-w-[3rem]');
    
    fs.writeFileSync(ldssFile, content, 'utf8');
    console.log('Fixed LastDrawStarSystems inner item styling');
}
