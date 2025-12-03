'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            console.log('LOGIN RESULT:', result);

            if (result?.error) {
                setError('Email ou password incorretos.');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('Ocorreu um erro ao tentar entrar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative overflow-hidden">
            {/* Left Side - Sales Pitch */}
            <div className="w-full md:w-1/2 relative overflow-hidden flex flex-col justify-center p-8 md:p-12 text-white">
                {/* Background Image & Overlay */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: "url('/mago-login.jpg')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-900/40" />

                <div className="relative z-20 max-w-lg mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg font-serif tracking-wide">
                        A Ciência dos <br />
                        <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">Números Mágicos</span>
                    </h1>
                    <p className="text-lg text-slate-200 mb-8 leading-relaxed drop-shadow-md">
                        Junte-se à comunidade que utiliza análise histórica avançada e estatística de precisão para identificar padrões e tendências.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 backdrop-blur flex items-center justify-center text-2xl group-hover:bg-blue-600/40 transition-colors shadow-lg border border-slate-700">📊</div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Análise Estatística Profunda</h3>
                                <p className="text-slate-300 text-sm drop-shadow">Acesso a históricos detalhados, frequências de números e estrelas, e padrões recorrentes.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 backdrop-blur text-amber-400 flex items-center justify-center text-2xl border border-amber-500/40 group-hover:bg-amber-500/30 transition-colors shadow-lg shadow-amber-500/10">🚀</div>
                            <div>
                                <h3 className="text-xl font-bold text-amber-400 mb-1 drop-shadow-md">Performance Superior</h3>
                                <p className="text-slate-200 text-sm drop-shadow">Ferramentas de desdobramento e algoritmos desenhados para procurar resultados consistentemente acima da média esperada.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10 bg-slate-950">
                <div className="max-w-md mx-auto w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white drop-shadow-lg font-serif">Bem-vindo de volta</h2>
                        <p className="text-slate-400 mt-2">Entre na sua conta para continuar.</p>
                    </div>

                    <Card className="p-6 bg-slate-900/50 backdrop-blur-md border-slate-800 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-3 rounded bg-slate-950/50 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-3 rounded bg-slate-950/50 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 border border-blue-500/20"
                            >
                                {loading ? 'A entrar...' : 'Entrar'}
                            </button>
                        </form>

                        <div className="mt-6 text-center relative z-10">
                            <p className="text-slate-400 text-sm">
                                Ainda não tem conta?{' '}
                                <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                                    Criar conta gratuita
                                </Link>
                            </p>
                        </div>
                    </Card>

                    <div className="mt-8 text-center">
                        <Link href="/contact" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">
                            Precisa de ajuda? Contacte-nos
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
