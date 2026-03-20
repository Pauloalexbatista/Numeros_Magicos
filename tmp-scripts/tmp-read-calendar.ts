import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'Master_Calendario_Auditoria_Rigida.csv');
const data = fs.readFileSync(file, 'utf8');
const lines = data.split('\n');

console.log('--- RELATÓRIO DE ERROS / FALTAS NO CALENDÁRIO ---');
let count = 0;
for (const line of lines) {
    if (line.includes('FALTA') || line.includes('ERRO')) {
        console.log(line.trim());
        count++;
    }
}
console.log(`\nTotal listado: ${count}`);
