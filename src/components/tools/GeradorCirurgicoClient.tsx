'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dices, 
  Sparkles, 
  Layers, 
  Flame, 
  Compass, 
  Brain, 
  Copy, 
  Check, 
  Sliders, 
  Wand2, 
  Zap, 
  Info,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Download
} from 'lucide-react';

interface SystemFamily {
  id: string;
  name: string;
  icon: string;
  description: string;
  systems: string[];
}

interface BlockData {
  name: string;
  numbers: number[];
}

interface KeyAnalysis {
  numbers: number[];
  signature: string;
  primeCount: number;
  primes: number[];
  digitalRoots: number[];
  sumDigitalRoots: number;
  keyRoot: number;
  teslaAxisCount: number;
  vortexCount: number;
  rodinPairsCount: number;
  fibonacciGapsCount: number;
  harmonicScore: number;
  isValidHarmonic: boolean;
}

const GAMES = [
  { id: 'euromillions', name: 'Euromilhões', color: '#10b981' },
  { id: 'totoloto', name: 'Totoloto', color: '#3b82f6' },
  { id: 'eurodreams', name: 'EuroDreams', color: '#8b5cf6' },
  { id: 'megasena', name: 'Mega-Sena', color: '#f59e0b' }
];

export default function GeradorCirurgicoClient() {
  const [activeGame, setActiveGame] = useState('euromillions');
  const [families, setFamilies] = useState<SystemFamily[]>([]);
  const [activeSystem, setActiveSystem] = useState('tiro_certeiro');
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);

  // Configuração do Gerador
  const [signatureType, setSignatureType] = useState<'1-1-1-1-1' | '2-1-1-1-0'>('1-1-1-1-1');
  const [keyCount, setKeyCount] = useState<number>(10);
  const [minHarmonicScore, setMinHarmonicScore] = useState<number>(70);

  // Chaves geradas
  const [generating, setGenerating] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<KeyAnalysis[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Carregar dados de blocos do sistema
  useEffect(() => {
    async function loadSystemBlocks() {
      setLoadingBlocks(true);
      try {
        const res = await fetch(`/api/tools/gerador-cirurgico?game=${activeGame}&system=${activeSystem}`);
        const data = await res.json();
        setFamilies(data.families || []);
        setBlocks(data.blocks || []);
      } catch (err) {
        console.error('Erro ao carregar blocos:', err);
      } finally {
        setLoadingBlocks(false);
      }
    }
    loadSystemBlocks();
  }, [activeGame, activeSystem]);

  // Gerar chaves cirúrgicas
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/tools/gerador-cirurgico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: activeGame,
          system: activeSystem,
          signatureType,
          count: keyCount,
          minHarmonicScore
        })
      });
      const data = await res.json();
      if (data.success && data.keys) {
        setGeneratedKeys(data.keys);
      }
    } catch (err) {
      console.error('Erro ao gerar chaves:', err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (numbers: number[], idx: number) => {
    navigator.clipboard.writeText(numbers.join(', '));
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllKeys = () => {
    if (generatedKeys.length === 0) return;
    const text = generatedKeys.map((k, i) => `Chave #${i + 1} (${k.signature}): ${k.numbers.join(', ')}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Seletor de Jogo */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {GAMES.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGame(g.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                activeGame === g.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
              {g.name}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Filtro Harmónico: <strong>Tesla (3-6-9) + Fibonacci + Primos</strong></span>
        </div>
      </div>

      {/* PAINEL DAS 4 FAMÍLIAS GENÉTICAS */}
      <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Famílias Genéticas de Sistemas
          </h3>
          <span className="text-xs text-slate-500">Escolha o especialista fornecedor das 25 bolas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {families.map(fam => {
            const isFamilyActive = fam.systems.includes(activeSystem);
            return (
              <div
                key={fam.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isFamilyActive
                    ? 'bg-slate-800/90 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white mb-1">
                  <span className="text-base">{fam.icon}</span>
                  <span className="truncate">{fam.name.split('—')[1]?.trim() || fam.name}</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 mb-2">
                  {fam.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {fam.systems.map(sysId => (
                    <button
                      key={sysId}
                      onClick={() => setActiveSystem(sysId)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        activeSystem === sysId
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {sysId.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ANATOMIA DE QUINTETOS: OS 5 BLOCOS DE 5 BOLAS */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Dices className="w-4 h-4 text-emerald-400" />
              Anatomia de Quintetos ({activeSystem.replace(/_/g, ' ').toUpperCase()})
            </h3>
            <p className="text-xs text-slate-400">
              As 25 bolas ordenadas por peso são particionadas em 5 blocos cirúrgicos para neutralizar o ruído.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
            25 Bolas Ativas
          </span>
        </div>

        {loadingBlocks ? (
          <div className="p-8 text-center text-slate-500 animate-pulse text-xs">
            A carregar blocos anatómicos...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {blocks.map((block, idx) => {
              const blockColors = [
                'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
                'border-teal-500/40 bg-teal-950/20 text-teal-400',
                'border-blue-500/40 bg-blue-950/20 text-blue-400',
                'border-indigo-500/40 bg-indigo-950/20 text-indigo-400',
                'border-purple-500/40 bg-purple-950/20 text-purple-400'
              ];
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${blockColors[idx]} space-y-2`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider">
                    {block.name}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {block.numbers.map(n => (
                      <span
                        key={n}
                        className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center border border-slate-700/80 shadow-sm"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BANCADA DE GERAÇÃO & FILTRO MOTOR EDISON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Configuração */}
        <div className="lg:col-span-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Configuração Cirúrgica
          </h3>

          {/* Assinatura da Chave */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Assinatura Anatómica da Chave
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSignatureType('1-1-1-1-1')}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  signatureType === '1-1-1-1-1'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-black flex items-center justify-between">
                  <span>Equilíbrio Sagrado (1-1-1-1-1)</span>
                  <span className="text-[10px] text-emerald-400 font-bold">1 de cada Bloco</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Distribuição perfeita pelos 5 níveis de peso. Máxima cobertura e economia.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSignatureType('2-1-1-1-0')}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  signatureType === '2-1-1-1-0'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-black flex items-center justify-between">
                  <span>Cluster Cirúrgico (2-1-1-1-0)</span>
                  <span className="text-[10px] text-amber-400 font-bold">2+1+1+1</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Concentra 2 bolas num bloco quente e 1 em outros três, descartando 1 bloco.
                </div>
              </button>
            </div>
          </div>

          {/* Quantidade de Chaves */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Quantidade de Chaves</span>
              <span className="font-black text-emerald-400">{keyCount} Chaves</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setKeyCount(cnt)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    keyCount === cnt
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro Harmónico Mínimo (Motor Edison) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Corte Harmónico Sagrado</span>
              <span className="font-black text-amber-400">≥ {minHarmonicScore}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={85}
              step={5}
              value={minHarmonicScore}
              onChange={(e) => setMinHarmonicScore(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-950 rounded-lg h-2 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Exige que as chaves cumpram as Leis de Tesla (3-6-9), gaps de Fibonacci e 1-2 números primos.
            </p>
          </div>

          {/* Botão Gerar */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-3.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {generating ? (
              <>A filtrar pelo Motor Edison...</>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Gerar Chaves Cirúrgicas
              </>
            )}
          </button>
        </div>

        {/* Coluna Resultados das Chaves */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Chaves Geradas com Harmonia Sagrada
              </h4>
              <span className="text-xs text-slate-500">
                {generatedKeys.length > 0 ? `${generatedKeys.length} chaves prontas a registar` : 'Clique em Gerar para produzir as combinações'}
              </span>
            </div>

            {generatedKeys.length > 0 && (
              <button
                type="button"
                onClick={copyAllKeys}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAll ? 'Copiadas!' : 'Copiar Todas'}
              </button>
            )}
          </div>

          {generatedKeys.length === 0 ? (
            <div className="p-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500 space-y-2">
              <Dices className="w-12 h-12 mx-auto text-slate-700" />
              <p className="text-sm font-bold text-slate-400">Nenhuma chave gerada ainda.</p>
              <p className="text-xs text-slate-500">Configure os parâmetros ao lado e clique em &quot;Gerar Chaves Cirúrgicas&quot;.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {generatedKeys.map((key, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Chave e Bolas */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-500 w-6">
                      #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {key.numbers.map(n => (
                        <span
                          key={n}
                          className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center border border-emerald-500/30 shadow-sm"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Diagnóstico Harmónico */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Harmonia: {key.harmonicScore}%
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {key.primeCount} Primos
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      Tesla: {key.teslaAxisCount}
                    </span>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(key.numbers, idx)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors ml-auto sm:ml-0"
                      title="Copiar Chave"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
