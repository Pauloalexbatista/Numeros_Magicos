const fs = require('fs');
let p1 = 'src/components/dashboard/LastDrawStarSystems.tsx';
let c1 = fs.readFileSync(p1, 'utf8');
c1 = c1.replace(/themeClasses.hitBadgePerfect/g, \"'bg-accent text-white'\");
c1 = c1.replace(/themeClasses.hitBadgeLow/g, \"'bg-surface-2 text-accent'\");
c1 = c1.replace(/px-3 py-1 rounded-full bg-accent text-white text-xs font-bold shadow-lg animate-pulse/g, 'shrink-0 px-3 py-1 rounded-full bg-accent text-white text-xs font-bold shadow-lg animate-pulse');
fs.writeFileSync(p1, c1, 'utf8');

let p2 = 'src/app/dashboard/[game]/page.tsx';
let c2 = fs.readFileSync(p2, 'utf8');
c2 = c2.replace(/systems=\\{topNumberSystems\\}/g, 'data={topNumberSystems}');
fs.writeFileSync(p2, c2, 'utf8');
console.log('Fixes applied');