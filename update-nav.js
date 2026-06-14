const fs = require('fs');

// Update MainNavigation.tsx
let content = fs.readFileSync('src/components/MainNavigation.tsx', 'utf8');
if (!content.includes('megasena')) {
    const megaSenaNav = `
  {
    id: 'megasena',
    name: 'Mega-Sena',
    href: '/dashboard/megasena',
    icon: Hash,
    accentVar: 'var(--mega-accent)',
    borderVar: 'var(--mega-border)',
  },`;
    content = content.replace(/borderVar: 'var\(--dream-border\)',\s*\},/, "borderVar: 'var(--dream-border)',\n  }," + megaSenaNav);
    fs.writeFileSync('src/components/MainNavigation.tsx', content, 'utf8');
}

// Update GameSelector.tsx
let content2 = fs.readFileSync('src/components/GameSelector.tsx', 'utf8');
if (!content2.includes('GameType.MEGASENA')) {
    content2 = content2.replace(/GameType\.EURODREAMS/g, "GameType.EURODREAMS,\n        GameType.MEGASENA");
    fs.writeFileSync('src/components/GameSelector.tsx', content2, 'utf8');
}

console.log('Added Mega-Sena to Navigation & Selector');
