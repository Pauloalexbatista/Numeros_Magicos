const fs = require('fs');
const file = 'src/components/SendToWheelingButton.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import for cn
if (!content.includes('import { cn }')) {
    content = content.replace(
        "import { useRouter } from 'next/navigation';",
        "import { useRouter } from 'next/navigation';\nimport { cn } from '@/lib/utils';"
    );
}

// Add style to props interface
content = content.replace(
  /interface SendToWheelingButtonProps \{([^}]*)\}/,
  (match, p1) => {
    if (p1.includes('style?:')) return match;
    return `interface SendToWheelingButtonProps {${p1}    style?: React.CSSProperties;\n}`;
  }
);

// Add style to component props
content = content.replace(
  /export default function SendToWheelingButton\(\{\s*numbers,\s*stars,\s*label,\s*className = ''\s*\}\: SendToWheelingButtonProps\) \{/,
  "export default function SendToWheelingButton({ numbers, stars, label, className = '', style }: SendToWheelingButtonProps) {"
);

// Fix className merge and add style prop
content = content.replace(
  /className=\{`px-4 py-2 bg-purple-600 hover:bg-purple-700\s*disabled:bg-gray-400 disabled:cursor-not-allowed\s*text-white font-bold rounded-lg transition-all\s*flex items-center gap-2 \$\{className\}`\}/,
  "className={cn('px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center gap-2', className)}\n            style={style}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed SendToWheelingButton.tsx');
