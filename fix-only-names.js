const fs = require('fs');

// Fix ONLY the system name text spans that were wrongly set to text-white
// These are the only 2 specific lines causing the light mode issue

// LastDrawNumberSystems - line 86: font-medium text-sm text-white truncate
const file1 = 'src/components/dashboard/LastDrawNumberSystems.tsx';
let c1 = fs.readFileSync(file1, 'utf8');
c1 = c1.replace(
    /<span className="font-medium text-sm text-white truncate">/g,
    '<span className="font-medium text-sm text-[var(--text-primary)] truncate">'
);
fs.writeFileSync(file1, c1, 'utf8');

// LastDrawStarSystems - line 89: font-bold text-white
const file2 = 'src/components/dashboard/LastDrawStarSystems.tsx';
let c2 = fs.readFileSync(file2, 'utf8');
c2 = c2.replace(
    /<span className="font-bold text-white">/g,
    '<span className="font-bold text-[var(--text-primary)]">'
);
fs.writeFileSync(file2, c2, 'utf8');

console.log('Fixed. Changed text-white -> text-[var(--text-primary)] ONLY on system name spans.');
