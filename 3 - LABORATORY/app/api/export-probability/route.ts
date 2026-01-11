import { NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs';

export async function POST() {
    try {
        console.log('📊 Fetching latest probability export...');
        console.log('📁 CWD:', process.cwd());

        // The exports directory is in the current working directory
        const exportsDir = path.join(process.cwd(), 'exports');
        console.log('📁 Looking in:', exportsDir);

        if (!fs.existsSync(exportsDir)) {
            console.error('❌ Exports directory not found:', exportsDir);
            return NextResponse.json(
                { error: `Exports directory not found at: ${exportsDir}. Please run the calculation scripts first.` },
                { status: 404 }
            );
        }

        const files = fs.readdirSync(exportsDir);
        console.log('📂 Files in exports:', files);

        const probabilityFiles = files.filter(f =>
            f.startsWith('probability-analysis-complete-') && f.endsWith('.xlsx')
        );
        console.log('📊 Probability files found:', probabilityFiles);

        if (probabilityFiles.length === 0) {
            return NextResponse.json(
                { error: 'No export file found. Please run: npx tsx scripts/export-all-tables.ts' },
                { status: 404 }
            );
        }

        // Get the most recent file
        const latestFile = probabilityFiles.sort().reverse()[0];
        const filePath = path.join(exportsDir, latestFile);
        console.log('📄 Reading file:', filePath);

        const fileBuffer = fs.readFileSync(filePath);
        console.log(`✅ File read successfully: ${latestFile} (${fileBuffer.length} bytes)`);

        // Return the file
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${latestFile}"`,
                'Content-Length': fileBuffer.length.toString(),
            },
        });

    } catch (error) {
        console.error('❌ Export error:', error);
        return NextResponse.json(
            { error: 'Failed to export probability data', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
