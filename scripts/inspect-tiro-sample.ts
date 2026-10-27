import fs from 'fs';
import path from 'path';

const fileTiro = path.join(process.cwd(), 'data', 'consolidated', 'tiro_certeiro_euromillions.json');
const dataTiro = JSON.parse(fs.readFileSync(fileTiro, 'utf-8'));
console.log('Sample record keys:', Object.keys(dataTiro[100]));
console.log('Sample record:', dataTiro[100]);
