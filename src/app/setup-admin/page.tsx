'use client';

import { useState } from 'react';
import { promoteToAdmin } from './actions';

export default function SetupAdminPage() {
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage('');
        setIsError(false);

        const result = await promoteToAdmin(formData);

        if (result.error) {
            setMessage(result.error);
            setIsError(true);
        } else if (result.success) {
            setMessage(result.success);
            setIsError(false);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-lg border border-slate-800 shadow-xl">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Configuração de Admin 🔐</h1>

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email do Utilizador</label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="exemplo@email.com"
                            className="w-full p-2 rounded bg-slate-950 border border-slate-700 text-white focus:border-amber-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Código de Segurança</label>
                        <input
                            type="password"
                            name="secret"
                            required
                            placeholder="Código Secreto"
                            className="w-full p-2 rounded bg-slate-950 border border-slate-700 text-white focus:border-amber-500 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded transition-colors disabled:opacity-50"
                    >
                        {loading ? 'A processar...' : 'Promover a ADMIN'}
                    </button>
                </form>

                {message && (
                    <div className={`mt-6 p-4 rounded text-center font-medium ${isError ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
                        {message}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <a href="/" className="text-slate-500 hover:text-slate-400 text-sm">Voltar à Home</a>
                </div>
            </div>
        </div>
    );
}
