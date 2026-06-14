const fs = require('fs');
const navFile = 'src/components/MainNavigation.tsx';
let content = fs.readFileSync(navFile, 'utf8');

const correctGames = `const GAMES = [
  {
    id: 'euromillions',
    name: 'Euromilhões',
    href: '/dashboard/euromillions',
    icon: (props: any) => <img src="https://flagcdn.com/eu.svg" alt="EU" className="w-3.5 h-auto rounded-sm" />,
    accentVar: 'var(--euro-accent)',
    borderVar: 'var(--euro-border)',
  },
  {
    id: 'totoloto',
    name: 'Totoloto',
    href: '/dashboard/totoloto',
    icon: (props: any) => <img src="https://flagcdn.com/pt.svg" alt="PT" className="w-3.5 h-auto rounded-sm" />,
    accentVar: 'var(--toto-accent)',
    borderVar: 'var(--toto-border)',
  },
  {
    id: 'eurodreams',
    name: 'EuroDreams',
    href: '/dashboard/eurodreams',
    icon: (props: any) => <img src="https://flagcdn.com/eu.svg" alt="EU" className="w-3.5 h-auto rounded-sm" />,
    accentVar: 'var(--dream-accent)',
    borderVar: 'var(--dream-border)',
  },
  {
    id: 'megasena',
    name: 'Mega-Sena',
    href: '/dashboard/megasena',
    icon: (props: any) => <img src="https://flagcdn.com/br.svg" alt="BR" className="w-3.5 h-auto rounded-sm" />,
    accentVar: 'var(--mega-accent)',
    borderVar: 'var(--mega-border)',
  },
];`;

content = content.replace(/const GAMES = \[[\s\S]*?\];/, correctGames);

fs.writeFileSync(navFile, content, 'utf8');
console.log('Fixed GAMES array in MainNavigation');
