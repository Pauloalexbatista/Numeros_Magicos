import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    console.log("=== VERIFICAÇÃO ONLINE ===");
    try {
        const sysRes = await fetch('https://numerosmagicos.com/api/admin/systems?secret=magia2026', { headers: { 'Accept': 'application/json'} });
        if (sysRes.ok) {
            const data = await sysRes.json() as any;
            const mlSystems = data.systems.filter((s:any) => s.systemType === 'NEURAL' || s.systemType === 'ML');
            console.log("Sistemas Neuronais ON-LINE ativados:");
            for (const s of mlSystems) {
                console.log(`- [${s.game}] ${s.name} | Ativo: ${s.isActive} | Rank Médio: ${s.ranking?.avgAccuracy}%`);
            }
        } else {
             console.log("Falha ao ler online", sysRes.status);
        }
        
        const neuralRes = await fetch('https://numerosmagicos.com/api/admin/neural-status?secret=magia2026', { headers: { 'Accept': 'application/json'} });
        if (neuralRes.ok) {
            const data = await neuralRes.json() as any;
            console.log("\nTreinos Neuronais ON-LINE:");
            const st = data.status;
            for (const g of ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO']) {
                if (st[g] && st[g].NUMBERS && st[g].NUMBERS.trained) console.log(`- ${g} NUMBERS treinado em ${st[g].NUMBERS.lastTrained}`);
                if (st[g] && st[g].STARS && st[g].STARS.trained) console.log(`- ${g} STARS treinado em ${st[g].STARS.lastTrained}`);
            }
        }
        
    } catch (e: any) { console.error("Erro online:", e.message); }

    console.log("\n=== VERIFICAÇÃO LOCAL ===");
    try {
        const activeLocal = await prisma.rankedSystem.findMany({
            where: { systemType: 'NEURAL' },
            include: { ranking: true }
        });
        console.log("Sistemas Neuronais LOCAL:");
        for (const s of activeLocal) {
            console.log(`- [${s.game}] ${s.name} | Ativo: ${s.isActive} | Rank Médio: ${s.ranking?.avgAccuracy || 'N/A'}%`);
        }
    } catch(e:any) { console.error("Erro local:", e.message); }
}

run().finally(() => prisma.$disconnect());
