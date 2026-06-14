const fs = require('fs');
const pageFile = 'src/app/dashboard/[game]/page.tsx';
let content = fs.readFileSync(pageFile, 'utf8');

// The block to remove is exactly:
// <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-1/60 p-4 shadow-sm backdrop-blur-md">
//    ...
// </div>
// It sits right before <LatestDrawWidget ... />

const widgetIndex = content.indexOf('<LatestDrawWidget');
const startIndex = content.lastIndexOf('<div className="flex items-center gap-4', widgetIndex);

if (startIndex !== -1 && widgetIndex !== -1) {
    content = content.substring(0, startIndex) + content.substring(widgetIndex);
    fs.writeFileSync(pageFile, content, 'utf8');
    console.log('Successfully removed the game header box!');
} else {
    console.log('Could not find the block to remove');
}
