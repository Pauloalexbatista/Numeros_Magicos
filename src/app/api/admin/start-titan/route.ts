import { NextResponse } from 'next/server';
import { runTitanLight } from '../../../../scripts/titan-light';

export const maxDuration = 300; // if vercel
let isTitanRunning = false;

export async function POST(request: Request) {
    try {
        const { secret } = await request.json();
        if (secret !== 'magia2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (isTitanRunning) return NextResponse.json({ error: 'O Titan já está em andamento na VPS (pode demorar dias).' }, { status: 400 });
        
        isTitanRunning = true;
        console.log('--- MOTOR TITAN DISPARADO VIA API ---');
        
        // Start in background on the Node event loop!
        runTitanLight()
            .then(() => { 
                console.log('✅ TITAN TERMINADO NA NUVEM');
                isTitanRunning = false; 
            })
            .catch((e) => { 
                console.error("❌ Titan failed:", e); 
                isTitanRunning = false; 
            });

        return NextResponse.json({ success: true, message: 'Motor Titan arrancou na VPS com sucesso! Podes fechar o site e deixar a VPS "suar"!' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
