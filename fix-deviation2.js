const fs = require('fs');

const files = [
    'src/components/analysis/SystemStatsViewer.tsx',
    'src/components/analysis/StarSystemStatsViewer.tsx',
    'src/components/IndividualSystemAnalysis.tsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // SystemStatsViewer uses `deviation`
        // IndividualSystemAnalysis uses `diff`
        
        content = content.replace(/Math\.abs\(deviation\) < 0\.5 \? 'text-muted-foreground' :\s*/g, '');
        content = content.replace(/Math\.abs\(deviation\) < 0\.5 \? "text-muted-foreground" :\s*/g, '');
        content = content.replace(/Math\.abs\(diff\) < 0\.5 \? 'text-muted-foreground' :\s*/g, '');
        content = content.replace(/Math\.abs\(diff\) < 0\.5 \? "text-muted-foreground" :\s*/g, '');
        
        // Also fix `diff > 0` syntax in IndividualSystemAnalysis if there's any
        // Let's just make it deviation > 0 ? 'text-emerald-600' : deviation < 0 ? 'text-rose-600' : 'text-muted-foreground'
        
        fs.writeFileSync(file, content, 'utf8');
        console.log("Updated " + file);
    }
});
