'use client';

import { Card } from '@/components/ui/card';
import { useState } from 'react';

export default function ExportCompleteButton() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await fetch('/api/admin/export-complete', {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Erro ao exportar');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Nome do ficheiro com data
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];

            a.download = `previsoes_completas_${dateStr}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('✅ Previsões completas exportadas com sucesso!');
        } catch (error) {
            console.error('Erro:', error);
            alert('❌ Erro ao exportar previsões completas');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-blue-500 transition-colors h-full flex flex-col justify-between">
            <div>
                <div className="text-3xl mb-4 bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center">📈</div>
                <h3 className="text-lg font-bold text-white">Previsões Completas</h3>
                <p className="text-zinc-400 text-sm mt-2">
                    Exportar previsões (Top 5, 10, 15, 20, 25) de todos os sistemas com ranking.
                </p>
            </div>
            <button
                onClick={handleExport}
                disabled={isExporting}
                className="mt-4 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
                {isExporting ? (
                    <>
                        <span className="animate-spin">⏳</span> EXPORTANDO...
                    </>
                ) : (
                    <>
                        <span>📊</span> EXPORTAR COMPLETO
                    </>
                )}
            </button>
        </Card>
    );
}
