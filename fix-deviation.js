const fs = require('fs');

const files = [
    'src/components/analysis/SystemStatsViewer.tsx',
    'src/components/analysis/StarSystemStatsViewer.tsx',
    'src/components/IndividualSystemAnalysis.tsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // We'll replace the deviation coloring logic
        // It might be `deviation > 1 ? ... : deviation < -1 ? ...` or similar.
        // Let's replace any `deviation > \d+` with `deviation > 0`
        // and `deviation < -\d+` with `deviation < 0`
        // Wait, wait... `diff` is used in IndividualSystemAnalysis.tsx
        content = content.replace(/deviation > 1( ?\?)/g, "deviation > 0$1");
        content = content.replace(/deviation < -1( ?\?)/g, "deviation < 0$1");
        
        content = content.replace(/diff > 1( ?\?)/g, "diff > 0$1");
        content = content.replace(/diff < -1( ?\?)/g, "diff < 0$1");
        
        // Let's also check > 0.5 or something
        content = content.replace(/deviation > 0\.5( ?\?)/g, "deviation > 0$1");
        content = content.replace(/deviation < -0\.5( ?\?)/g, "deviation < 0$1");
        
        fs.writeFileSync(file, content, 'utf8');
        console.log("Updated " + file);
    }
});
