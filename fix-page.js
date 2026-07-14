const fs = require('fs');
const file = 'src/app/analysis/history/[systemName]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regexInterfaces = /interface Peak \{[\s\S]*?power: number;\n\}/;
content = content.replace(regexInterfaces, `interface Peak {
    year: number;
    jackpots: number;
    type: 'peak' | 'valley';
}

interface PrizeRecoveryStats {
    currentStreak: number;
    averageDrawsBetween: number;
    maxDrawsBetween: number;
    status: 'hot' | 'warming' | 'cold';
}

interface RecoveryStats {
    jackpot: PrizeRecoveryStats;
    highPrize: PrizeRecoveryStats;
}

interface RadarStats {
    consistency: number;
    frequency: number;
    resilience: number;
    power: number;
}`);

const regexCalc = /\/\/ Calculate Recovery Stats \(Drawdown\)[\s\S]*?const recoveryStats: RecoveryStats = \{[\s\S]*?status: recoveryStatus\n    \};/;

content = content.replace(regexCalc, `// Calculate Recovery Stats
    function calcRecovery(targetHits: number): PrizeRecoveryStats {
        let lastIndex = -1;
        let intervals: number[] = [];
        performances.forEach((perf, index) => {
            if (perf.hits === targetHits) {
                if (lastIndex !== -1) intervals.push(index - lastIndex);
                lastIndex = index;
            }
        });
        const currentStreak = lastIndex !== -1 ? (performances.length - 1 - lastIndex) : performances.length;
        const averageDrawsBetween = intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : 0;
        const maxDrawsBetween = intervals.length > 0 ? Math.max(...intervals) : performances.length;
        
        let status: 'hot' | 'warming' | 'cold' = 'cold';
        if (averageDrawsBetween > 0) {
            if (currentStreak >= averageDrawsBetween) status = 'hot';
            else if (currentStreak >= averageDrawsBetween * 0.7) status = 'warming';
        }
        return { currentStreak, averageDrawsBetween, maxDrawsBetween, status };
    }

    const recoveryStats: RecoveryStats = {
        jackpot: calcRecovery(maxNumbers),
        highPrize: calcRecovery(maxNumbers - 1)
    };`);

// Update averageDrawsBetween reference for RadarStats resilience calculation
content = content.replace("const resilience = averageDrawsBetween > 0 ? Math.min(100, Math.round(Math.max(0, 100 - (averageDrawsBetween * 2)))) : 0;", "const resilience = recoveryStats.jackpot.averageDrawsBetween > 0 ? Math.min(100, Math.round(Math.max(0, 100 - (recoveryStats.jackpot.averageDrawsBetween * 2)))) : 0;");

// Update AntiSystemComparison props
content = content.replace("recoveryStatus={analysis.recoveryStats.status}", "recoveryStatus={analysis.recoveryStats.jackpot.status}");
content = content.replace("currentStreak={analysis.recoveryStats.currentStreak}", "currentStreak={analysis.recoveryStats.jackpot.currentStreak}");

fs.writeFileSync(file, content, 'utf8');
