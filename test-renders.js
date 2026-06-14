const { exec } = require('child_process');

console.log("Starting Next.js dev server...");
const next = exec('npm run dev', { cwd: '.' });
let hasError = false;

next.stdout.on('data', (data) => {
    // console.log(data);
    if (data.includes('Ready in')) {
        console.log("Server ready! Fetching dashboard...");
        exec('curl -s http://localhost:3000/dashboard/euromillions', (err, stdout, stderr) => {
            // we don't care about the output, just trigger the render
        });
        exec('curl -s http://localhost:3000/games', (err, stdout, stderr) => {
            // trigger the games render
        });
        exec('curl -s http://localhost:3000/ranking/euromillions', (err, stdout, stderr) => {
            // trigger the ranking render
        });
    }
    if (data.includes('Error:') || data.includes('ReferenceError') || data.includes('TypeError') || data.includes('Exception') || data.includes('SyntaxError')) {
        console.error("RUNTIME ERROR LOGGED: ", data);
        hasError = true;
    }
});

next.stderr.on('data', (data) => {
    console.error("STDERR: ", data);
    hasError = true;
});

setTimeout(() => {
    console.log("Killing server after 15s...");
    next.kill();
    if (!hasError) console.log("No errors caught during render tests.");
    process.exit(0);
}, 15000);
