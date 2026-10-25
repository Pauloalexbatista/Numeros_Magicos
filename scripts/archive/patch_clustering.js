const fs = require('fs');
let content = fs.readFileSync('src/services/ranked-systems.ts', 'utf8');

const target = `export async function generateClustering(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const maxNum = getMaxNumber(draws);
    const predCount = returnFullPool ? maxNum : getNumberPredictionCount(draws);
    const recentDraws = draws.slice(0, 20);

    // Determinar quantidade de clusters (grupos de 10)
    const numClusters = Math.ceil(maxNum / 10);
    const clusters = {};
    for (let i = 1; i <= numClusters; i++) {
        clusters[i] = [];
    }

    // Contar ocorrencias nos ultimos 20 sorteios por cluster
    recentDraws.forEach(draw => {
        parseNumbers(draw).forEach(num => {
            const clusterId = Math.ceil(num / 10);
            if (clusters[clusterId] !== undefined) {
                clusters[clusterId].push(num);
            }
        });
    });

    // Calcular a atividade de cada cluster (numero de saidas totais nele)
    const clusterActivity = Object.entries(clusters).map(([id, nums]: [string, any]) => ({
        id: parseInt(id),
        count: nums.length
    }));

    // Ordenar clusters pelo mais ativo
    clusterActivity.sort((a, b) => b.count - a.count || a.id - b.id);

    // Contar frequencias individuais nos ultimos 20 e global
    const recentFreq = {};
    const globalFreq = {};
    for (let i = 1; i <= maxNum; i++) {
        recentFreq[i] = 0;
        globalFreq[i] = 0;
    }

    draws.forEach(draw => {
        parseNumbers(draw).forEach(num => {
            if (globalFreq[num] !== undefined) globalFreq[num]++;
        });
    });

    recentDraws.forEach(draw => {
        parseNumbers(draw).forEach(num => {
            if (recentFreq[num] !== undefined) recentFreq[num]++;
        });
    });

    // Montar a lista ordenada completa
    const candidates: number[] = [];
    clusterActivity.forEach(activity => {
        const clusterId = activity.id;
        const startNum = (clusterId - 1) * 10 + 1;
        const endNum = Math.min(clusterId * 10, maxNum);

        // Obter os numeros deste cluster e ordena-los internamente
        const clusterNums: number[] = [];
        for (let num = startNum; num <= endNum; num++) {
            clusterNums.push(num);
        }

        clusterNums.sort((a, b) => {
            const diff = recentFreq[b] - recentFreq[a];
            if (diff !== 0) return diff;
            return globalFreq[b] - globalFreq[a]; // desempate global
        });

        candidates.push(...clusterNums);
    });

    return ensureN(candidates, draws, returnFullPool);
}`;

const replacement = `export async function generateClustering(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const { predCount: defaultPredCount, maxNum } = getGameConfig(draws);
    const predCount = returnFullPool ? maxNum : defaultPredCount;

    if (!draws || draws.length === 0) {
        return Array.from({ length: predCount }, (_, i) => i + 1);
    }

    // --- GUARDA DE INVERSÃO TEMPORAL AUTOMÁTICA ---
    const d0 = new Date(draws[0].date).getTime();
    const dEnd = new Date(draws[draws.length - 1].date).getTime();
    const chronDraws = (d0 < dEnd) ? [...draws].reverse() : draws;

    // Janela padrão de 50 sorteios
    const recent50 = chronDraws.slice(0, 50);

    const numClusters = Math.ceil(maxNum / 10);
    const clusterActivity: Record<number, number> = {};
    const freq50: Record<number, number> = {};
    const globalFreq: Record<number, number> = {};

    for (let i = 1; i <= numClusters; i++) clusterActivity[i] = 0;
    for (let i = 1; i <= maxNum; i++) {
        freq50[i] = 0;
        globalFreq[i] = 0;
    }

    chronDraws.forEach(draw => {
        parseNumbers(draw).forEach(num => {
            if (globalFreq[num] !== undefined) globalFreq[num]++;
        });
    });

    recent50.forEach(draw => {
        parseNumbers(draw).forEach(num => {
            const cId = Math.ceil(num / 10);
            if (clusterActivity[cId] !== undefined) clusterActivity[cId]++;
            if (freq50[num] !== undefined) freq50[num]++;
        });
    });

    // Ordenar clusters por atividade (descendente), desempate id asc
    const sortedClusters = Object.entries(clusterActivity)
        .map(([id, count]) => ({ id: Number(id), count }))
        .sort((a, b) => b.count - a.count || a.id - b.id);

    const candidates: number[] = [];
    sortedClusters.forEach(cluster => {
        const startNum = (cluster.id - 1) * 10 + 1;
        const endNum = Math.min(cluster.id * 10, maxNum);

        const numsInCluster: number[] = [];
        for (let n = startNum; n <= endNum; n++) {
            numsInCluster.push(n);
        }

        // Ordenar internamente no cluster por freq50 desc -> globalFreq desc -> num asc
        numsInCluster.sort((a, b) => {
            const diff50 = freq50[b] - freq50[a];
            if (diff50 !== 0) return diff50;

            const diffGlobal = globalFreq[b] - globalFreq[a];
            if (diffGlobal !== 0) return diffGlobal;

            return a - b;
        });

        candidates.push(...numsInCluster);
    });

    return candidates.slice(0, predCount);
}`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (!normContent.includes(normTarget)) {
    console.error('Target generateClustering not found in ranked-systems.ts!');
    process.exit(1);
}

fs.writeFileSync('src/services/ranked-systems.ts', normContent.replace(normTarget, normReplacement), 'utf8');
console.log('Successfully updated generateClustering to 50 draws');
