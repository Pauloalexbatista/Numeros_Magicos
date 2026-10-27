import fs from 'fs';
import path from 'path';

const euroFile = path.join(process.cwd(), 'data', 'consolidated', 'separacao_aguas_v2_euromillions.json');
const totoFile = path.join(process.cwd(), 'data', 'consolidated', 'separacao_aguas_v2_totoloto.json');

const euro = JSON.parse(fs.readFileSync(euroFile, 'utf-8'));
const toto = JSON.parse(fs.readFileSync(totoFile, 'utf-8'));

console.log('EUROMILLIONS (Últimos 15 sorteios):');
console.log(euro.slice(-15).map((r: any) => ({
  date: r.draw.date.slice(0, 10),
  hits: r.num_hits_25
})));

console.log('\nTOTOLOTO (Últimos 15 sorteios):');
console.log(toto.slice(-15).map((r: any) => ({
  date: r.draw.date.slice(0, 10),
  hits: r.num_hits_25
})));
