const fs = require('fs');
const navFile = 'src/components/MainNavigation.tsx';
let navContent = fs.readFileSync(navFile, 'utf8');

navContent = navContent.replace(/icon: \(\) =>/g, "icon: (props: any) =>");

fs.writeFileSync(navFile, navContent, 'utf8');
console.log('Fixed MainNavigation Icon prop error');
