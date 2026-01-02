import HistoryTimelineClient from '../components/HistoryTimelineClient';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';

export default function HistoryTimelinePage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="p-4 border-b border-slate-800/50 bg-slate-900/20 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Voltar ao Laboratório
                    </Link>
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                        <Clock className="w-4 h-4" /> Timeline de Regimes v1.0
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4">
                        Cronologia de Entropia
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Mapeamento histórico das mudanças de regime (Saturado vs Estável) desde 2021.
                    </p>
                </header>
                <HistoryTimelineClient />
            </div>
        </div>
    );
}
