const fs = require('fs');

let code = fs.readFileSync('src/app/games/page.tsx', 'utf8');

// The ranking logic is here:
//                   {loadingRanking ? (
//                     <SkeletonLines count={5} />
//                   ) : ranking.length ? (

const target = `                  {loadingRanking ? (
                    <SkeletonLines count={5} />
                  ) : ranking.length ? (`;

const replacement = `                  {loadingRanking ? (
                    <SkeletonLines count={5} />
                  ) : selected.id === 'megasena' ? (
                    <div className="rounded-xl border border-dashed border-border/70 bg-surface-2/40 px-3 py-4 text-xs text-muted-foreground flex items-center justify-center h-32">
                      <div className="text-center">
                        <span className="block font-semibold mb-1">A recalibrar sistemas</span>
                        <span className="opacity-80">Os algoritmos preditivos para a Mega-Sena estão em fase final de testes. Disponível em breve.</span>
                      </div>
                    </div>
                  ) : ranking.length ? (`;

code = code.replace(target, replacement);

fs.writeFileSync('src/app/games/page.tsx', code, 'utf8');
console.log('Hid Mega-Sena rankings!');
