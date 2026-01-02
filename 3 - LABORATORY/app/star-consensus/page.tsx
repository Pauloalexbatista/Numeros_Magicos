import StarConsensusClient from '../components/StarConsensusClient';
import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';

export default function StarConsensusPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="p-4">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" /> Voltar ao Laboratório
                </Link>
                <div className="flex items-center gap-2 mb-4">
                    <Star className="w-6 h-6 text-yellow-500" />
                    <h1 className="text-2xl font-bold text-white">Consenso de Estrelas</h1>
                </div>
            </div>
            <StarConsensusClient />
        </div>
    );
}
