'use client';

import Link from 'next/link';
import { TrendingUp, ArrowRight } from 'lucide-react';

export default function MeanReversionCard({ title, description, icon }: any) {
    return (
        <div className="h-full flex flex-col justify-between p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl border border-indigo-700/50 shadow-lg hover:shadow-indigo-500/20 transition-all group">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                        <TrendingUp className="w-8 h-8 text-indigo-400" />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full">
                        NOVO
                    </span>
                </div>

                <h3 className="text-xl font-bold mb-2 text-indigo-100">{title}</h3>
                <p className="text-sm text-indigo-200/70 leading-relaxed">
                    {description}
                </p>
            </div>

            <Link
                href="/analysis/mean-reversion"
                className="mt-6 flex items-center justify-between w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-medium text-sm group-hover:translate-x-1"
            >
                <span>Analisar Tendências</span>
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
