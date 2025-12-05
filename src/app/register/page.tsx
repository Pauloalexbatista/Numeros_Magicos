'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { registerUser } from '../auth/actions';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        try {
            const result = await registerUser(formData);

            if (result.error) {
                setError(result.error);
            } else {
                // Redirect to login on success
                router.push('/login?registered=true');
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8 relative z-10">
                    <h1 className="text-3xl font-bold text-white">Criar Conta</h1>
                    <p className="text-slate-400 mt-2">Junte-se à comunidade de elite.</p>
                </div>

                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0 opacity-60 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/imagem1.png')" }}
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-900/80 pointer-events-none" />

                <Card className="p-6 bg-slate-900/80 backdrop-blur-sm border-slate-800 relative z-10">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Nome</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full p-3 rounded bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Seu Nome"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full p-3 rounded bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="w-full p-3 rounded bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                name="terms"
                                type="checkbox"
                                required
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="text-sm text-slate-400">
                                Li e aceito os <Link href="/legal/terms" target="_blank" className="text-blue-400 hover:underline">Termos e Condições</Link> e a <Link href="/legal/privacy" target="_blank" className="text-blue-400 hover:underline">Política de Privacidade</Link>.
                            </label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                name="newsletter"
                                type="checkbox"
                                defaultChecked
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="text-sm text-slate-400">
                                Quero receber novidades e previsões exclusivas por email.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'A criar conta...' : 'Criar Conta Gratuita'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-400 text-sm">
                            Já tem conta?{' '}
                            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                                Entrar
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
