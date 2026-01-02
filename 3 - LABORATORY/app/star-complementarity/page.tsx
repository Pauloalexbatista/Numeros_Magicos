'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import StarComplementarityClient from '../components/StarComplementarityClient';

export default function StarComplementarityPage() {
    return (
        <div className="min-h-screen bg-slate-950 p-4 font-sans text-slate-200">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Voltar ao Laboratório
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-2">
                            <Star className="w-8 h-8 text-yellow-500" />
                            Complementaridade de Estrelas
                        </h1>
                        <p className="text-slate-400">Descubra quais sistemas de estrelas se complementam melhor</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto">
                <StarComplementarityClient />
            </div>
        </div>
    );
}
