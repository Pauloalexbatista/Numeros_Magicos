'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { Download } from 'lucide-react';

export default function ExportAuditButton() {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/export-audit');
            if (!response.ok) throw new Error('Falha na exportação');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `auditoria_completa_sistemas_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert('Erro ao gerar ficheiro de auditoria.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-blue-500 transition-colors h-full flex flex-col justify-between">
            <div>
                <div className="text-3xl mb-4 bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400">Auditoria Total</h3>
                <p className="text-zinc-400 text-sm mt-2">
                    Download dos dados RAW de todos os sistemas, desde o Sorteio #1. (Heavy)
                </p>
            </div>
            <div className="mt-4">
                <Button
                    onClick={handleExport}
                    disabled={loading}
                    variant="outline"
                    className="w-full border-blue-500/20 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                >
                    {loading ? 'A Gerar...' : 'Baixar Auditoria'}
                </Button>
            </div>
        </Card>
    );
}
