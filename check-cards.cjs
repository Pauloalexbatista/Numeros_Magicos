const fs = require('fs');
const content = fs.readFileSync('src/app/admin/health/page.tsx', 'utf8');

const count = (str, sub) => str.split(sub).length - 1;

const chunks = content.split('className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col"');
console.log('Total chunks:', chunks.length);

for (let i = 1; i < chunks.length; i++) {
    const card = chunks[i];
    const so = count(card, '<span');
    const sc = count(card, '</span');
    const do_o = count(card, '<div');
    const dc = count(card, '</div');
    const cb_o = count(card, '{');
    const cb_c = count(card, '}');
    
    // A normal card should have the same number of opens as closes
    if (so !== sc || do_o !== dc || cb_o !== cb_c) {
        console.log(`CHUNK ${i} IS UNBALANCED!`);
        console.log(`Span: ${so} open vs ${sc} close`);
        console.log(`Div: ${do_o} open vs ${dc} close`);
        console.log(`Braces: ${cb_o} open vs ${cb_c} close`);
        // print a small excerpt to identify it
        console.log('Excerpt:');
        console.log(card.substring(1, 150));
        console.log('------');
    }
}
