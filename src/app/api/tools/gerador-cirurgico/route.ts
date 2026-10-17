import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { 
  SYSTEM_FAMILIES, 
  generateSurgicalKeys, 
  analyzeKeyHarmonics 
} from '@/services/harmonic-generator';

export const dynamic = 'force-dynamic';

function getSystemTop25(gameKey: string, systemId: string): number[] {
  const fileName = `${systemId}_${gameKey}.json`;
  const filePath = path.resolve(process.cwd(), 'data/consolidated', fileName);

  if (!fs.existsSync(filePath)) {
    return Array.from({ length: 25 }, (_, i) => i + 1);
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length === 0) {
      return Array.from({ length: 25 }, (_, i) => i + 1);
    }

    const latest = data[data.length - 1];
    const pred = typeof latest.prediction === 'string' ? JSON.parse(latest.prediction) : latest.prediction;
    if (Array.isArray(pred) && pred.length >= 25) {
      return pred.slice(0, 25);
    }
    return Array.from({ length: 25 }, (_, i) => i + 1);
  } catch (e) {
    return Array.from({ length: 25 }, (_, i) => i + 1);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game') || 'euromillions';
    const system = searchParams.get('system') || 'tiro_certeiro';

    const top25 = getSystemTop25(game, system);

    const blocks = [
      { name: 'Bloco 1 (Top 1-5)', numbers: top25.slice(0, 5) },
      { name: 'Bloco 2 (Top 6-10)', numbers: top25.slice(5, 10) },
      { name: 'Bloco 3 (Top 11-15)', numbers: top25.slice(10, 15) },
      { name: 'Bloco 4 (Top 16-20)', numbers: top25.slice(15, 20) },
      { name: 'Bloco 5 (Top 21-25)', numbers: top25.slice(20, 25) }
    ];

    return NextResponse.json({
      game,
      system,
      families: SYSTEM_FAMILIES,
      top25,
      blocks
    });
  } catch (error: any) {
    console.error('Erro na API Gerador Cirúrgico (GET):', error);
    return NextResponse.json(
      { error: 'Falha ao carregar blocos do sistema', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      game = 'euromillions', 
      system = 'tiro_certeiro', 
      signatureType = '1-1-1-1-1', 
      count = 10, 
      minHarmonicScore = 70,
      customPool = null
    } = body;

    const poolToUse = customPool && Array.isArray(customPool) && customPool.length >= 25
      ? customPool
      : getSystemTop25(game, system);

    const keys = generateSurgicalKeys(
      poolToUse,
      signatureType,
      Math.min(50, Math.max(1, count)),
      minHarmonicScore
    );

    return NextResponse.json({
      success: true,
      game,
      system,
      signatureType,
      requestedCount: count,
      generatedCount: keys.length,
      keys
    });
  } catch (error: any) {
    console.error('Erro na API Gerador Cirúrgico (POST):', error);
    return NextResponse.json(
      { error: 'Falha ao gerar chaves cirúrgicas', details: error.message },
      { status: 500 }
    );
  }
}
