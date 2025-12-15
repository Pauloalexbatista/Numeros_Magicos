
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Assuming shadcn button exists or standard html button

export default function UpdatePredictionsButton() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleUpdate = async () => {
        if (!confirm('Tem a certeza que deseja recalcular TODAS as previsões? Isto pode demorar 1-2 minutos.')) return;

        setLoading(true);
        setStatus('idle');

        try {
            const res = await fetch('/api/admin/trigger-update', { method: 'POST' });
            if (!res.ok) throw new Error('Falha no update');

            setStatus('success');
            setTimeout(() => setStatus('idle'), 5000);
            alert('✅ Previsões atualizadas com sucesso!');
            window.location.reload(); // Refresh to see changes
        } catch (error) {
            console.error(error);
            setStatus('error');
            alert('❌ Erro ao atualizar previsões.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleUpdate}
            disabled={loading}
            className={`
                px-4 py-2 rounded-lg font-bold text-white transition-all shadow-lg flex items-center gap-2
                ${loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500'}
            `}
        >
            {loading ? (
                <>
                    <span className="animate-spin">⏳</span> A processar...
                </>
            ) : (
                <>
                    ⚡ Atualizar Previsões (Prod)
                </>
            )}
        </button>
    );
}
