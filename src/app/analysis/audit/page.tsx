import { getActiveSystems } from './actions';
import AuditPageClient from './AuditPageClient';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { ShieldCheck, Lock, Binary } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
    const systems = await getActiveSystems();

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Auditoria Estatística & Walk-Forward (P7)
                        </span>
                        <span className="text-xs text-slate-500">Versão 2.1 • Gaiola de Ferro</span>
                    </div>
                    <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        Painel Público de Auditoria e Integridade
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                        Acompanhe a integridade determinística das previsões: cada chave possui selo SHA-256 gerado pré-sorteio e pode ser recalculada em tempo real contra a base histórica.
                    </p>
                </div>
            </div>

            {/* Banner Metodológico: Ensaio Cego & Popper */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-400">
                        <Lock className="w-4 h-4" />
                        <span>Ensaio Cego (Out-of-Sample)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Previsões após 1 de Outubro de 2026 funcionam como conjunto prospetivo estritamente virgem (sem calibração retroativa).
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-400">
                        <Binary className="w-4 h-4" />
                        <span>Selo Imutável SHA-256</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Assinatura criptográfica calculada às 20:30 UTC antes da extração física das esferas para prova pública de anterioridade.
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Regra de Falseabilidade (Popper)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Se em 100 sorteios consecutivos Walk-Forward a significância cair abaixo de Z &lt; 1.65σ (p &gt; 0.05), a hipótese é refutada.
                    </p>
                </div>
            </div>

            <AuditPageClient initialSystems={systems} />
            <ResponsibleGamingFooter />
        </div>
    );
}
