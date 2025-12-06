import { spawn } from 'child_process';
import path from 'path';

export function startBackgroundTraining() {
    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'turbo-ml.ts');

    console.log('🚀 Spawning background ML training...');

    // Spawn the process detached
    const child = spawn('npx', ['tsx', scriptPath], {
        detached: true,
        stdio: 'ignore', // Ignore stdio to allow detachment
        cwd: process.cwd(),
        env: process.env
    });

    child.unref(); // Allow parent to exit independently

    return true;
}

// If run directly
if (require.main === module) {
    startBackgroundTraining();
}
