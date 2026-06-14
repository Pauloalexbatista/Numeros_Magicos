const fs = require('fs');

let code = fs.readFileSync('src/app/games/page.tsx', 'utf8');

code = code.replace(
  '                </div>\r\n              </div>\r\n            )}\r\n\r\n            <div className="rounded-2xl border border-dashed',
  '                </div>\r\n              </div>\r\n            </div>\r\n            )}\r\n\r\n            <div className="rounded-2xl border border-dashed'
);

code = code.replace(
  '                </div>\n              </div>\n            )}\n\n            <div className="rounded-2xl border border-dashed',
  '                </div>\n              </div>\n            </div>\n            )}\n\n            <div className="rounded-2xl border border-dashed'
);

fs.writeFileSync('src/app/games/page.tsx', code, 'utf8');
console.log('Restored missing </div>!');
