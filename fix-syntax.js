const fs = require('fs');

let code = fs.readFileSync('src/app/games/page.tsx', 'utf8');

// The file currently has `{selected.id !== 'megasena' && (` opened but never closed.
// We need to replace the `</div>` that precedes the Ad banner with `)}\n`
// Actually, it's safer to just replace `</div>\n\n            <div className="rounded-2xl border border-dashed border-border/70`
// with `)}\n\n            <div className="rounded-2xl border border-dashed border-border/70`

code = code.replace(/<\/div>\r?\n\s*<div className="rounded-2xl border border-dashed border-border\/70 bg-surface-1\/40 px-4 py-3 flex items-center justify-between">/, `)}\n\n            <div className="rounded-2xl border border-dashed border-border/70 bg-surface-1/40 px-4 py-3 flex items-center justify-between">`);

// Wait, looking at the exact text from Select-Object:
//                 </div>
//               </div>
//             </div>
// 
//             <div className="rounded-2xl border border-dashed border-border/70 bg-surface-1/40 px-4 py-3 flex items-center justify-between">

code = code.replace('                </div>\n              </div>\n            </div>\n\n            <div className="rounded-2xl border border-dashed border-border/70 bg-surface-1/40 px-4 py-3 flex items-center justify-between">', 
                    '                </div>\n              </div>\n            )}\n\n            <div className="rounded-2xl border border-dashed border-border/70 bg-surface-1/40 px-4 py-3 flex items-center justify-between">');
// Try with \r\n
code = code.replace('                </div>\r\n              </div>\r\n            </div>\r\n\r\n            <div className="rounded-2xl border border-dashed border-border/70 bg-surface-1/40 px-4 py-3 flex items-center justify-between">', 
                    '                </div>\r\n              </div>\r\n            )}\r\n\r\n            <div className="rounded-2xl border border-dashed border-border/70 bg-surface-1/40 px-4 py-3 flex items-center justify-between">');

fs.writeFileSync('src/app/games/page.tsx', code, 'utf8');
console.log('Fixed syntax error!');
