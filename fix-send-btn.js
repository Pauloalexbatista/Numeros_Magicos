const fs = require('fs');
const file = 'src/components/SendToWheelingButton.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add style to props interface
content = content.replace(
  /interface SendToWheelingButtonProps \{(\s*numbers: number\[\];\s*label\?: string;\s*className\?: string;\s*)\}/,
  "interface SendToWheelingButtonProps {$1    style?: React.CSSProperties;\n}"
);

// Add style to component props
content = content.replace(
  /export default function SendToWheelingButton\(\{\s*numbers,\s*label = 'Desdobrar',\s*className = ''\s*\}\: SendToWheelingButtonProps\) \{/,
  "export default function SendToWheelingButton({ numbers, label = 'Desdobrar', className = '', style = {} }: SendToWheelingButtonProps) {"
);

// Apply style to the button
content = content.replace(
  /className=\{`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-sm \$\{className\}`\}\s*onClick=\{handleSend\}/,
  "className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-sm ${className}`} onClick={handleSend} style={style}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed SendToWheelingButton props');
