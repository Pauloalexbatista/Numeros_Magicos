import { spawn } from 'child_process';
import path from 'path';

export function startBackgroundTraining(gameName: string = 'EUROMILLIONS') {
    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'ml-training', 'turbo-ml.ts');
    
    console.log(`🚀 Dispatching Production Background AI Training for ${gameName}...`);

    try {
        const child = spawn('npx', ['tsx', scriptPath, gameName.toUpperCase()], {
            detached: true,
            stdio: 'ignore', // Crucial for detaching the parent HTTP response
            cwd: process.cwd(),
            env: process.env
        });

        child.unref(); 
        console.log(`✅ Background Process Detached. Training AI safely outside Event Loop.`);
        return true;
    } catch (e) {
        console.error('Failed to spawn turbo-ml:', e);
        return false;
    }
}

// If run directly
if (require.main === module) {
    startBackgroundTraining(process.argv[2] || 'EUROMILLIONS');
}
