const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Add game-specific accent overrides
let additions = `
[data-game="EUROMILLIONS"] { 
  --accent: var(--euro-accent);
  --accent-hover: color-mix(in srgb, var(--euro-accent) 80%, black);
  --accent-muted: color-mix(in srgb, var(--euro-accent) 20%, transparent);
  --accent-border: color-mix(in srgb, var(--euro-accent) 50%, transparent);
}
[data-game="TOTOLOTO"] { 
  --accent: var(--toto-accent);
  --accent-hover: color-mix(in srgb, var(--toto-accent) 80%, black);
  --accent-muted: color-mix(in srgb, var(--toto-accent) 20%, transparent);
  --accent-border: color-mix(in srgb, var(--toto-accent) 50%, transparent);
}
[data-game="EURODREAMS"] { 
  --accent: var(--dream-accent);
  --accent-hover: color-mix(in srgb, var(--dream-accent) 80%, black);
  --accent-muted: color-mix(in srgb, var(--dream-accent) 20%, transparent);
  --accent-border: color-mix(in srgb, var(--dream-accent) 50%, transparent);
}
[data-game="MEGASENA"] { 
  --accent: var(--mega-accent);
  --accent-hover: color-mix(in srgb, var(--mega-accent) 80%, black);
  --accent-muted: color-mix(in srgb, var(--mega-accent) 20%, transparent);
  --accent-border: color-mix(in srgb, var(--mega-accent) 50%, transparent);
}
`;

css = css + '\n' + additions;
fs.writeFileSync('src/app/globals.css', css, 'utf8');
console.log('CSS overrides added');