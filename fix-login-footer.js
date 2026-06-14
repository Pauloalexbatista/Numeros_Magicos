const fs = require('fs');

const loginFile = 'src/app/login/page.tsx';
let loginContent = fs.readFileSync(loginFile, 'utf8');

loginContent = loginContent.replace(/Acesso gratuito.*?análise estatística/, '{t("footer_info")}');
loginContent = loginContent.replace(/Acesso gratuito.*anlise estatstica/, '{t("footer_info")}');

fs.writeFileSync(loginFile, loginContent, 'utf8');
console.log('Fixed login page footer');
