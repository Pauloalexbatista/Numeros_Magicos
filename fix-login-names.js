const fs = require('fs');

// Fix login page game names
const loginFile = 'src/app/login/page.tsx';
let loginContent = fs.readFileSync(loginFile, 'utf8');

if (!loginContent.includes("useTranslations('nav')")) {
  loginContent = loginContent.replace("const t = useTranslations('login');", "const t = useTranslations('login');\n  const tNav = useTranslations('nav');");
}

loginContent = loginContent.replace(/\[\'euro\',\s*\'Euromilhões\'\]/g, "['euro', tNav('euromillions')]");
loginContent = loginContent.replace(/\[\'toto\',\s*\'Totoloto\'\]/g, "['toto', tNav('totoloto')]");
loginContent = loginContent.replace(/\[\'dream\',\s*\'EuroDreams\'\]/g, "['dream', tNav('eurodreams')]");
loginContent = loginContent.replace(/\[\'mega\',\s*\'Mega-Sena\'\]/g, "['mega', tNav('megasena')]");

loginContent = loginContent.replace("const gameLabel = { euro: 'Euromilhões', toto: 'Totoloto', dream: 'EuroDreams', mega: 'Mega-Sena' }[game];", "const gameLabel = { euro: tNav('euromillions'), toto: tNav('totoloto'), dream: tNav('eurodreams'), mega: tNav('megasena') }[game];");

fs.writeFileSync(loginFile, loginContent, 'utf8');
console.log('Fixed login page game names');

// Fix dashboard page game names
const dashFile = 'src/app/dashboard/[game]/page.tsx';
let dashContent = fs.readFileSync(dashFile, 'utf8');

if (!dashContent.includes("useTranslations('nav')")) {
  dashContent = dashContent.replace("const t = await getTranslations('dashboard');", "const t = await getTranslations('dashboard');\n    const tNav = await getTranslations('nav');");
}

dashContent = dashContent.replace("{gameConfig.name}", "{tNav(game as any) || gameConfig.name}");

fs.writeFileSync(dashFile, dashContent, 'utf8');
console.log('Fixed dash page game names');
