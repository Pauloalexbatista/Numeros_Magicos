const fs = require('fs');
const cp = require('child_process');

let contentList = fs.readFileSync('src/app/admin/health/page.tsx', 'utf8').split('\n');

function checkSyntax(linesArray) {
    fs.writeFileSync('src/binary_test.tsx', linesArray.join('\n'));
    try {
        cp.execSync('npx tsc src/binary_test.tsx --noEmit --jsx react --skipLibCheck --esModuleInterop', { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
}

// We know the file starts with lines 1-415 and ends with 1341-1346 (roughly).
// We want to test if replacing lines [start, end] with "" makes it compile.

let test1 = [...contentList.slice(0, 415), ...contentList.slice(1209)];
if (checkSyntax(test1)) {
    console.log("Error is BETWEEN 415 and 1209 !");
} else {
    console.log("Error is OUTSIDE 415-1209 !");
}
