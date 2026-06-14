const fs = require('fs');
const pageFile = 'src/app/dashboard/[game]/page.tsx';
let content = fs.readFileSync(pageFile, 'utf8');

const target = `<div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-1/60 p-4 shadow-sm backdrop-blur-md">
                    <div className="text-4xl">{gameConfig.ui.flag}</div>
                    <div>
                        <h1 className={\`text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r \${titleGrad} tracking-tight\`}>
                            {gameConfig.name}
                        </h1>
                        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t("subtitle")}
                        </p>
                    </div>
                </div>`;

content = content.replace(target, '');
fs.writeFileSync(pageFile, content, 'utf8');
console.log('Removed game header box from dashboard page');
