const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/LastDrawStarSystems.tsx', 'utf8');

// Remove themeClasses object
let startIndex = code.indexOf('const themeClasses = {');
if (startIndex > -1) {
    // find the end of the object
    let endIndex = code.indexOf('};', startIndex);
    if (endIndex > -1) {
        code = code.substring(0, startIndex) + code.substring(endIndex + 2);
    }
}

// Replace usages with generic accent classes
code = code.replace(/$\{themeClasses.border\}/g,     'border-accent-border');
code = code.replace(/$\{themeClasses.bg\}/g,         'bg-surface-1/60');
code = code.replace(/$\{themeClasses.headerText\}/g, 'text-accent');
code = code.replace(/$\{themeClasses.headerIcon\}/g, 'text-accent');
code = code.replace(/$\{themeClasses.headerBorder\}/g,'border-accent-border');
code = code.replace(/$\{themeConfig.badgeBg\}/g,     'bg-accent');
code = code.replace(/$\{themeClasses.badgeBg\}/g,    'bg-accent');
code = code.replace(/$\{themeClasses.badgeText\}/g,  'text-white');
code = code.replace(/$\{themeClasses.itemBg\}/g,     'bg-surface-1/60');
code = code.replace(/$\{themeClasses.itemBorder\}/g, 'border-accent-border');
code = code.replace(/$\{themeClasses.hitBadgePerfect\}/g, 'bg-accent text-white');
code = code.replace(/$\{themeClasses.hitBadgeLow\}/g, 'bg-surface-2 text-accent');
code = code.replace(/$\{themeClasses.perfectText\}/g, 'text-accent');

code = code.replace(/$\{themeClasses.gradient\}/g,   'from-accent-muted to-transparent');

fs.writeFileSync('src/app/dashboard/LastDrawStarSystems.tsx', code, 'utf8');
console.log('Updated ...');