"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Lock, LockOpen } from "lucide-react";

type Draw = { date: string; numbers: string | number[]; stars: string | number[] };
type Ranking = { systemName: string; avgAccuracy: number; totalPredictions: number };

export default function LoginPage() {
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [latestDraw, setLatestDraw] = useState<Draw | null>(null);
  const [topSystem, setTopSystem] = useState<Ranking | null>(null);
  const [drawsUsed, setDrawsUsed] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [drawsRes, rankingRes, meanRes] = await Promise.all([
          fetch('/api/draws').then(res => res.json().catch(() => [])),
          fetch('/api/ranking').then(res => res.json().catch(() => ({}))),
          fetch('/api/mean').then(res => res.json().catch(() => ({})))
        ]);
        
        if (drawsRes && Array.isArray(drawsRes) && drawsRes.length > 0) {
          setLatestDraw(drawsRes[0]);
        }
        if (rankingRes && rankingRes.ranking && rankingRes.ranking.length > 0) {
          // Filtrar Random Forest caso ainda venha da API
          const validRanking = rankingRes.ranking.filter((r: any) => !r.systemName.includes('Random Forest') && !r.systemName.includes('ML Classifier'));
          if (validRanking.length > 0) {
            setTopSystem(validRanking[0]);
          }
        }
        if (meanRes && typeof meanRes.drawsUsed === 'number') {
          setDrawsUsed(meanRes.drawsUsed);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
    } catch {
      return dateString;
    }
  };

  const handleLogin = () => {
    router.push('/dashboard/euromillions');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-dm-sans relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Background blobs and grid */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#4A8FE7]/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#4A8FE7]/10 blur-[120px]"></div>
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center space-y-12">
        <h1 className="text-4xl md:text-5xl font-syne font-bold text-center leading-tight tracking-tight max-w-2xl">
          Sabes qual sistema teria ganho <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A8FE7] to-blue-400">mais jackpots</span> nos últimos 10 anos?
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full relative">
          
          <div className="flex flex-col space-y-8">
            
            {/* Card Visível: Resumo com dados reais */}
            <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl">
              <h3 className="font-syne text-xl font-semibold mb-4 text-card-foreground">Resumo da Análise</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="text-muted-foreground text-sm">Último Sorteio</span>
                  <span className="font-medium text-foreground">
                    {loading ? 'A carregar...' : latestDraw ? formatDate(latestDraw.date) : 'Indisponível'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="text-muted-foreground text-sm">Top Sistema Atual</span>
                  <div className="text-right">
                    <span className="block font-medium text-foreground">{loading ? 'A carregar...' : topSystem?.systemName || 'N/A'}</span>
                    {topSystem && (
                      <span className="text-xs text-[#4A8FE7] font-semibold">
                        +{topSystem.avgAccuracy > 1 ? topSystem.avgAccuracy.toFixed(1) : (topSystem.avgAccuracy * 100).toFixed(1)}% acerto
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Sorteios Analisados</span>
                  <span className="font-medium text-foreground">{loading ? '...' : drawsUsed}</span>
                </div>
              </div>
            </div>

            {/* Card Desfocado: Comparativo */}
            <div className={`bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl transition-all duration-700 ${!acceptedTerms ? 'filter blur-[8px] opacity-50 select-none pointer-events-none' : ''}`}>
              <h3 className="font-syne text-xl font-semibold mb-4 text-card-foreground">Comparação vs Aleatório</h3>
              <div className="space-y-5 mt-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Top Sistema (Otimizado)</span>
                    <span className="text-[#4A8FE7] font-semibold">Alto</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-[#4A8FE7] h-2 rounded-full w-[85%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Seleção Aleatória (Baseline)</span>
                    <span className="text-muted-foreground font-semibold">Baixo</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-muted-foreground/30 h-2 rounded-full w-[25%]"></div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          <div className="flex flex-col space-y-8">
            {/* Lock Overlay Content */}
            {!acceptedTerms ? (
              <div className="h-full flex flex-col items-center justify-center z-20">
                <div className="bg-card/80 backdrop-blur-xl border border-border p-8 rounded-3xl shadow-2xl w-full text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="font-syne text-2xl font-bold mb-2">Acesso Restrito</h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Para aceder a estas estatísticas detalhadas e ao ranking completo, precisamos que confirmes que compreendes os riscos.
                  </p>
                  
                  {/* Disclaimer Oficial Aprovado */}
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl flex items-start text-left mb-6 w-full">
                    <AlertTriangle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                      Aviso legal: O jogo pode ser viciante. Os dados apresentados são estritamente estatísticos, históricos e académicos, não garantindo quaisquer ganhos futuros no Euromilhões ou noutros jogos. Jogue de forma responsável e com moderação. Mais informações em <a href="https://www.sicad.pt" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-amber-400">sicad.pt</a>.
                    </p>
                  </div>

                  <label className="flex items-center space-x-3 cursor-pointer mb-6 w-full text-left">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-input bg-background text-[#4A8FE7] focus:ring-[#4A8FE7]/50 focus:ring-offset-background"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                    <span className="text-sm text-foreground font-medium">
                      Li, compreendi os riscos e aceito os termos descritos.
                    </span>
                  </label>

                  <div className="w-full">
                    <button 
                      disabled={!acceptedTerms}
                      onClick={handleLogin}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center space-x-2
                        ${acceptedTerms 
                          ? 'bg-[#4A8FE7] text-primary-foreground shadow-lg shadow-[#4A8FE7]/25 hover:shadow-[#4A8FE7]/40 hover:scale-[1.02]' 
                          : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                    >
                      {acceptedTerms ? <LockOpen className="w-4 h-4 mr-2" /> : null}
                      <span>Entrar e explorar os dados &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col space-y-8 bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl transition-all duration-700">
                 <h3 className="font-syne text-xl font-semibold mb-4 text-card-foreground">Acesso Autorizado</h3>
                 <p className="text-muted-foreground text-sm mb-6">Aviso legal lido e aceite. Pode agora iniciar sessão para explorar as estatísticas completas e o ranking detalhado de cada sistema preditivo.</p>
                 <div className="mt-auto w-full">
                    <button 
                      onClick={handleLogin}
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center space-x-2 bg-[#4A8FE7] text-primary-foreground shadow-lg shadow-[#4A8FE7]/25 hover:shadow-[#4A8FE7]/40 hover:scale-[1.02]"
                    >
                      <LockOpen className="w-4 h-4 mr-2" />
                      <span>Entrar e explorar os dados &rarr;</span>
                    </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
