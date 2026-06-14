const fs = require('fs');

let code = fs.readFileSync('src/app/games/page.tsx', 'utf8');

// 1. Fix the corrupted disclaimer string
// Look for anything resembling "a componente suplementar/estrelas tem comportamento diferente dos"
code = code.replace(/<div className="rounded-xl border border-dashed border-border\/70 bg-surface-2\/40 px-3 py-4 text-xs text-muted-foreground">[\s\S]*?<\/div>/g, 
  `<div className="rounded-xl border border-dashed border-border/70 bg-surface-2/40 px-3 py-4 text-xs text-muted-foreground">\n                        {t("labels.starsDisclaimer", { game: selected.title })}\n                      </div>`);

// 2. Conditionally render the right box and span the left box
// Find the first box start:
// <div className="rounded-2xl border border-border/70 bg-surface-1/60 p-5 shadow-sm">
// We need to replace only the first occurrence after grid-cols-2
const gridStart = '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">';
const box1Start = '<div className="rounded-2xl border border-border/70 bg-surface-1/60 p-5 shadow-sm">';
const box1NewStart = '<div className={`rounded-2xl border border-border/70 bg-surface-1/60 p-5 shadow-sm ${selected.id === \'megasena\' ? \'md:col-span-2\' : \'\'}`}>';

// Find the second box start:
// <div className="rounded-2xl border border-border/70 bg-surface-1/60 p-5 shadow-sm">
// It occurs again. We want to wrap it.
let parts = code.split('<div className="grid grid-cols-1 md:grid-cols-2 gap-4">');
if (parts.length > 1) {
  let gridContent = parts[1];
  
  // Replace first box start
  gridContent = gridContent.replace(box1Start, box1NewStart);
  
  // Replace second box start by splitting
  let boxParts = gridContent.split(box1Start); // The remaining one should be the second box
  if (boxParts.length > 1) {
    boxParts[1] = `{selected.id !== 'megasena' && (\n              <div className="rounded-2xl border border-border/70 bg-surface-1/60 p-5 shadow-sm">` + boxParts[1];
    
    // We need to find where the second box ends.
    // The second box ends right before:
    // <div className="rounded-2xl border border-dashed border-border/70 bg-surface-1/40 px-4 py-3 flex items-center justify-between">
    let endParts = boxParts[1].split('              <div className="rounded-2xl border border-dashed');
    if (endParts.length > 1) {
      endParts[0] = endParts[0] + '              )}\n';
      boxParts[1] = endParts.join('              <div className="rounded-2xl border border-dashed');
    }
  }
  gridContent = boxParts.join('');
  code = parts[0] + '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">' + gridContent;
}

fs.writeFileSync('src/app/games/page.tsx', code, 'utf8');
console.log('Fixed Mega-Sena missing supplement logic and garbled text!');
