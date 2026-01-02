import SystemConsensusClient from '../components/SystemConsensusClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ConsensusPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="p-4">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" /> Voltar ao Laboratório
                </Link>
            </div>
            <SystemConsensusClient />
        </div>
    );
}
