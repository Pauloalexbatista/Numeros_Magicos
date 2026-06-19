import React from 'react';
import FullPoolViewerClient from './Client';
import { Activity } from 'lucide-react';

export const metadata = {
    title: 'Visualizador de Pools Completas - Números Mágicos',
    description: 'Análise detalhada de pools completas de previsão.'
};

export default function FullPoolViewerPage() {
    return (
        <main className="min-h-screen pb-24 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Análise de Pools Completas</h1>
                            <p className="text-muted-foreground text-lg">Validação de acertos por blocos de importância (Full Pool)</p>
                        </div>
                    </div>
                </header>

                <FullPoolViewerClient />
            </div>
        </main>
    );
}