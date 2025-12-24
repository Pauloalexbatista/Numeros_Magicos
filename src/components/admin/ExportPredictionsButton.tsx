'use client';

import { Card } from '@/components/ui/card';

export default function ExportPredictionsButton() {
    const handleExport = async () => {
        try {
            const response = await fetch('/api/admin/export-predictions', {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Erro ao exportar');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Nome do ficheiro com data
            const today = new Date();
            const nextFriday = new Date(today);
            nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
            const dateStr = `${String(nextFriday.getDate()).padStart(2, '0')}${String(nextFriday.getMonth() + 1).padStart(2, '0')}${nextFriday.getFullYear()}`;

            a.download = `previsao_${dateStr}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('✅ Previsões exportadas com sucesso!');
        } catch (error) {
            console.error('Erro:', error);
            alert('❌ Erro ao exportar previsões');
        }
    };

    return (
        <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-cyan-500 transition-colors h-full flex flex-col justify-between">
            <div>
                <div className="text-3xl mb-4 bg-cyan-500/10 w-12 h-12 rounded-lg flex items-center justify-center">📊</div>
                <h3 className="text-lg font-bold text-white">Exportar Previsões</h3>
                <p className="text-zinc-400 text-sm mt-2">
                    Exportar todas as previsões atuais para Excel com data do próximo sorteio.
                </p>
            </div>
            <button
                onClick={handleExport}
                className="mt-4 w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
                <span>📥</span> EXPORTAR EXCEL
            </button>
        </Card>
    );
}
