import StarLabClient from '../components/StarLabClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function StarLabPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="p-4 border-b border-slate-800/50 bg-slate-900/20 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Voltar ao Laboratório
                    </Link>
                    <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                        Star Lab v1.0
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 mb-4">
                        ⭐ Laboratório de Estrelas
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Análise experimental para descobrir padrões e aumentar a precisão nas estrelas do EuroMilhões
                    </p>
                </header>
                <StarLabClient />
            </div>
        </div>
    );
}
