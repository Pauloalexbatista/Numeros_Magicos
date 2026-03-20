import { prisma } from './src/lib/prisma';
import fs from 'fs';
import path from 'path';

const DAYS_PT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

async function getFirstDraw(game: 'EUROMILLIONS'|'EURODREAMS'|'TOTOLOTO', dayOfWeek: number): Promise<Date | null> {
    // Find the very first draw of a particular game that falls on a specific day of the week
    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'asc' }
    });
    for (const d of draws) {
        if (d.date.getUTCDay() === dayOfWeek) return d.date;
    }
    return null;
}

async function run() {
    console.log('🗓️ A preparar o Calendário Master de Auditoria...');

    const first_EM_Tue = await getFirstDraw('EUROMILLIONS', 2);
    const first_EM_Fri = await getFirstDraw('EUROMILLIONS', 5);
    const first_TT_Wed = await getFirstDraw('TOTOLOTO', 3);
    const first_TT_Sat = await getFirstDraw('TOTOLOTO', 6);
    const first_ED_Mon = await getFirstDraw('EURODREAMS', 1);
    const first_ED_Thu = await getFirstDraw('EURODREAMS', 4);

    console.log('Datas de Início Detetadas na DB:');
    console.log('- EuroMillions Terças:', first_EM_Tue?.toISOString().split('T')[0]);
    console.log('- EuroMillions Sextas:', first_EM_Fri?.toISOString().split('T')[0]);
    console.log('- Totoloto Quartas:', first_TT_Wed?.toISOString().split('T')[0]);
    console.log('- Totoloto Sábados:', first_TT_Sat?.toISOString().split('T')[0]);
    console.log('- EuroDreams Segundas:', first_ED_Mon?.toISOString().split('T')[0]);
    console.log('- EuroDreams Quintas:', first_ED_Thu?.toISOString().split('T')[0]);

    // O Calendário começa no dia do primeiro sorteio mais antigo que tivermos na DB
    const allStarts = [first_EM_Tue, first_EM_Fri, first_TT_Wed, first_TT_Sat, first_ED_Mon, first_ED_Thu].filter(d => d !== null) as Date[];
    const globalStartDate = new Date(Math.min(...allStarts.map(d => d.getTime())));

    // Pre-buscar TUDO da DB num Map indexado por Data "YYYY-MM-DD"
    const allDraws = await prisma.draw.findMany();
    const dbMap: { [dateStr: string]: string[] } = {};
    for (const draw of allDraws) {
        const dStr = draw.date.toISOString().split('T')[0];
        if (!dbMap[dStr]) dbMap[dStr] = [];
        dbMap[dStr].push(draw.game);
    }

    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);

    let currentDate = new Date(globalStartDate);
    currentDate.setUTCHours(12, 0, 0, 0);

    const lines = [];
    lines.push('DATA;DIA DA SEMANA;JOGOS ESPERADOS (TEORIA);JOGOS NA BD (REALIDADE);ESTADO AUDITORIA;OBSERVACOES OBRIGATORIAS');

    let totalErros = 0;
    let totalFaltas = 0;

    while (currentDate <= today) {
        const iso = currentDate.toISOString().split('T')[0];
        const day = currentDate.getUTCDay();

        const expected: string[] = [];

        if (day === 2 && first_EM_Tue && currentDate >= first_EM_Tue) expected.push('EUROMILLIONS');
        if (day === 5 && first_EM_Fri && currentDate >= first_EM_Fri) expected.push('EUROMILLIONS');
        
        if (day === 3 && first_TT_Wed && currentDate >= first_TT_Wed) expected.push('TOTOLOTO');
        if (day === 6 && first_TT_Sat && currentDate >= first_TT_Sat) expected.push('TOTOLOTO');

        if (day === 1 && first_ED_Mon && currentDate >= first_ED_Mon) expected.push('EURODREAMS');
        if (day === 4 && first_ED_Thu && currentDate >= first_ED_Thu) expected.push('EURODREAMS');

        const found = dbMap[iso] || [];

        // Comparação de Auditoria
        let obs = [];
        let estado = 'OK';

        // 1. O que devia estar, está cá?
        for (const exp of expected) {
            if (!found.includes(exp)) {
                obs.push(`FALTA SORTEIO: ${exp}`);
            }
        }

        // 2. O que está cá, não devia estar?
        for (const fnd of found) {
            if (!expected.includes(fnd)) {
                obs.push(`ERRO GRAVE: SORTEIO EXTRA DA BD QUE NAO ERA SUPOSTO EXISTIR NESTE DIA (${fnd})`);
            }
        }

        if (obs.length > 0) {
            if (obs.some(o => o.includes('FALTA'))) {
                estado = 'FALTA';
                totalFaltas++;
            }
            if (obs.some(o => o.includes('ERRO GRAVE'))) {
                estado = 'ERRO_GRAVE';
                totalErros++;
            }
        } else {
            estado = expected.length === 0 ? 'CALMO (Nenhum Jogo)' : 'TUDO PRESENTE E BEM DATADO';
        }

        // Formatação PT DD/MM/YYYY
        const d = String(currentDate.getUTCDate()).padStart(2, '0');
        const m = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
        const y = currentDate.getUTCFullYear();
        const ptDate = `${d}/${m}/${y}`;

        const row = [
            ptDate,
            DAYS_PT[day],
            expected.length > 0 ? expected.join(', ') : 'NENHUM',
            found.length > 0 ? found.join(', ') : 'NENHUM',
            estado,
            obs.join(' | ')
        ];
        lines.push(row.join(';'));

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    const filepath = path.join(process.cwd(), 'Master_Calendario_Auditoria_Rigida.csv');
    fs.writeFileSync(filepath, '\ufeff' + lines.join('\n'), 'utf8');

    console.log(`✅ Concluído! Foi gerado o calendário com uma linha para CADA DIA dos últimos 20 anos.`);
    console.log(`➡️ Foram encontrados ${totalFaltas} dias com faltas de sorteio.`);
    console.log(`➡️ Foram encontrados ${totalErros} dias com sorteios em dias não previstos.`);
    console.log(`➡️ Guardado em: ${filepath}`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
