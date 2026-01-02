import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const scriptPath = path.join(process.cwd(), 'find_best_combination.ts');

        return new Promise((resolve) => {
            // Updated command to use npx tsx and pass --json flag
            // Increased maxBuffer to handle potential large output if any (though we silence logs)
            exec(`npx tsx "${scriptPath}" --json`, {
                cwd: process.cwd(),
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer just in case
            }, (error, stdout, stderr) => {
                if (error) {
                    console.error('Script Error:', stderr);
                    resolve(NextResponse.json({
                        success: false,
                        error: 'Failed to execute analysis script',
                        details: stderr || error.message
                    }, { status: 500 }));
                    return;
                }

                try {
                    // Parse the last line or find JSON in output
                    // Since we silenced logs, stdout should be pure JSON
                    // But in case npx outputs something, let's look for valid JSON
                    const jsonStart = stdout.indexOf('{');
                    const jsonEnd = stdout.lastIndexOf('}');

                    if (jsonStart === -1 || jsonEnd === -1) {
                        throw new Error('No JSON output found');
                    }

                    const jsonStr = stdout.substring(jsonStart, jsonEnd + 1);
                    const data = JSON.parse(jsonStr);
                    resolve(NextResponse.json(data));
                } catch (parseError: any) {
                    console.error('Parse Error:', parseError, stdout);
                    resolve(NextResponse.json({
                        success: false,
                        error: 'Invalid script output',
                        details: parseError.message
                    }, { status: 500 }));
                }
            });
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
