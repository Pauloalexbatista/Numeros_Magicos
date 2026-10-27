import fs from 'fs';
import path from 'path';

const consolidatedDir = path.join(process.cwd(), 'data', 'consolidated');
const systems = ['clustering', 'ultimos_a_sair', 'mais_quentes', 'piramide_pascal', 'tiro_certeiro'];

systems.forEach(s => {
  const f = path.join(consolidatedDir, `${s}_totoloto.json`);
  if (fs.existsSync(f)) {
    const data = JSON.parse(fs.readFileSync(f, 'utf-8'));
    const last = data[data.length - 1];
    console.log(`${s}_totoloto: count = ${data.length}, last drawId = ${last.drawId}, date = ${last.draw?.date}`);
  } else {
    console.log(`${s}_totoloto: NOT FOUND`);
  }
});
