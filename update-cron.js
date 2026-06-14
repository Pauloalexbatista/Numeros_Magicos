const fs = require('fs');

let content = fs.readFileSync('src/app/api/cron/update/route.ts', 'utf8');

// Add import
if (!content.includes('MegaSenaService')) {
    content = content.replace(/import \{ EuroDreamsService \} from '@\/services\/euroDreamsService';/, 
        "import { EuroDreamsService } from '@/services/euroDreamsService';\nimport { MegaSenaService } from '@/services/megaSenaService';");
}

// Refactor drawSchedule
if (content.includes('const todaySchedule = drawSchedule[day];')) {
    const oldSchedule = `        type GameEntry = { game: string; service: () => { updateDatabase: () => Promise<boolean> } };
        const drawSchedule: Record<number, GameEntry> = {
            1: { game: 'EuroDreams', service: () => new EuroDreamsService() },
            4: { game: 'EuroDreams', service: () => new EuroDreamsService() },
            2: { game: 'EuroMillions', service: () => new EuroMillionsService() },
            5: { game: 'EuroMillions', service: () => new EuroMillionsService() },
            3: { game: 'Totoloto', service: () => new TotolotoService() },
            6: { game: 'Totoloto', service: () => new TotolotoService() },
        };

        const todaySchedule = drawSchedule[day];

        if (!todaySchedule) {
            console.log(\`? [Cron] \${dayNames[day]} — Nenhum sorteio hoje. A saltar.\`);
            return NextResponse.json({
                success: true,
                message: \`Nenhum sorteio ao \${dayNames[day]}. Cron ignorado.\`,
                day: dayNames[day],
                timestamp: new Date().toISOString()
            });
        }`;

    const newSchedule = `        type GameEntry = { game: string; service: () => { updateDatabase: () => Promise<boolean> } };
        const drawSchedule: Record<number, GameEntry[]> = {
            1: [{ game: 'EuroDreams', service: () => new EuroDreamsService() }],
            4: [
                { game: 'EuroDreams', service: () => new EuroDreamsService() },
                { game: 'MegaSena', service: () => new MegaSenaService() }
            ],
            2: [
                { game: 'EuroMillions', service: () => new EuroMillionsService() },
                { game: 'MegaSena', service: () => new MegaSenaService() }
            ],
            5: [{ game: 'EuroMillions', service: () => new EuroMillionsService() }],
            3: [{ game: 'Totoloto', service: () => new TotolotoService() }],
            6: [
                { game: 'Totoloto', service: () => new TotolotoService() },
                { game: 'MegaSena', service: () => new MegaSenaService() }
            ],
        };

        const todaySchedules = drawSchedule[day];

        if (!todaySchedules || todaySchedules.length === 0) {
            console.log(\`? [Cron] \${dayNames[day]} — Nenhum sorteio hoje. A saltar.\`);
            return NextResponse.json({
                success: true,
                message: \`Nenhum sorteio ao \${dayNames[day]}. Cron ignorado.\`,
                day: dayNames[day],
                timestamp: new Date().toISOString()
            });
        }`;

    // Regex safely replace the declaration logic
    content = content.replace(/type GameEntry = \{[\s\S]*?timestamp: new Date\(\)\.toISOString\(\)\n\s*\}\);\n\s*\}/, newSchedule);
    
    // Fix the execution logic
    const oldExec = `        const serviceInstance = todaySchedule.service();
        console.log(\`?? [Cron] A iniciar atualização para \${todaySchedule.game} ao \${dayNames[day]}...\`);

        const updated = await serviceInstance.updateDatabase();

        return NextResponse.json({
            success: true,
            game: todaySchedule.game,
            updated,
            timestamp: new Date().toISOString()
        });`;

    const newExec = `        let results = [];
        for (const schedule of todaySchedules) {
            const serviceInstance = schedule.service();
            console.log(\`?? [Cron] A iniciar atualização para \${schedule.game} ao \${dayNames[day]}...\`);
            try {
                const updated = await serviceInstance.updateDatabase();
                results.push({ game: schedule.game, updated, error: null });
            } catch (err: any) {
                console.error(\`? [Cron] Falha ao atualizar \${schedule.game}:\`, err);
                results.push({ game: schedule.game, updated: false, error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            results,
            timestamp: new Date().toISOString()
        });`;

    content = content.replace(/const serviceInstance = todaySchedule\.service\(\);[\s\S]*?timestamp: new Date\(\)\.toISOString\(\)\n\s*\}\);/, newExec);
}

fs.writeFileSync('src/app/api/cron/update/route.ts', content, 'utf8');
console.log('Updated Cron Route');
