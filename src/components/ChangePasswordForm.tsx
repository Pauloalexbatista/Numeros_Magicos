'use client';

import { useState } from 'react';
import { updatePassword } from '@/app/auth/actions';

export function ChangePasswordForm({ email }: { email: string }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        formData.append('email', email);

        try {
            const result = await updatePassword(formData);
            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'Password atualizada com sucesso!' });
                (e.target as HTMLFormElement).reset();
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Ocorreu um erro ao atualizar a password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
                <div className={`p-3 rounded text-sm ${message.type === 'success'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium">Nova Password</label>
                <input
                    name="newPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Confirmar Nova Password</label>
                <input
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {loading ? 'A atualizar...' : 'Atualizar Password'}
            </button>
        </form>
    );
}
