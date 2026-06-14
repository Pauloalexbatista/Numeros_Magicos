const fs = require('fs');

const file = 'src/app/patterns/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldFunc = `    const getHeatColor = (value: number, max: number) => {
        if (max === 0) return '#13151C';
        const ratio = Math.min(1, Math.max(0, value / max));
        // stays within token palette via inline style; consistent with unified tokens
        return ratio > 0.7
            ? 'rgba(74,143,231,0.18)'
            : ratio > 0.35
                ? 'rgba(74,143,231,0.10)'
                : 'rgba(255,255,255,0.03)';
    };`;

const newFunc = `    const getHeatColor = (value: number, max: number, reverse: boolean = false) => {
        if (max === 0) return '#13151C';
        let ratio = Math.min(1, Math.max(0, value / max));
        if (reverse) ratio = 1 - ratio;
        // stays within token palette via inline style; consistent with unified tokens
        return ratio > 0.7
            ? 'rgba(74,143,231,0.18)'
            : ratio > 0.35
                ? 'rgba(74,143,231,0.10)'
                : 'rgba(255,255,255,0.03)';
    };`;

content = content.replace(oldFunc, newFunc);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed patterns page args.');
