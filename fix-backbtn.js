const fs = require('fs');
const file = 'src/components/ui/BackButton.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add style to props
content = content.replace(
  /interface BackButtonProps \{(\n\s+href\?: string;\n\s+label\?: string;\n\s+className\?: string;\n\s+iconClassName\?: string;\n)\}/,
  "interface BackButtonProps {$1    style?: React.CSSProperties;\n}"
);

content = content.replace(
  /export default function BackButton\(\{ href = '\/', label = 'Voltar', className = '', iconClassName = '' \}: BackButtonProps\) \{/g,
  "export default function BackButton({ href = '/', label = 'Voltar', className = '', iconClassName = '', style = {} }: BackButtonProps) {"
);

content = content.replace(
  /className=\{`flex items-center justify-center w-10 h-10 rounded-lg bg-surface-1\/50 text-muted-foreground hover:bg-surface-2 transition-all \$\{className\}`\}/,
  "className={`flex items-center justify-center w-10 h-10 rounded-lg bg-surface-1/50 text-muted-foreground hover:bg-surface-2 transition-all ${className}`} style={style}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed BackButton props');
