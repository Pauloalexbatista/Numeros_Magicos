'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate disclaimer checkbox
        if (!agreedToDisclaimer) {
            setError('Tem de aceitar o disclaimer antes de entrar.');
            return;
        }

        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Email ou password incorretos.');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative overflow-hidden">
            {/* Left Side - Welcome Message */}
            <div className="w-full md:w-1/2 relative overflow-hidden flex flex-col justify-center p-8 md:p-12 text-white bg-slate-900">
                <div className="max-w-xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight drop-shadow-lg font-serif">
                        Bem-vindo aos <br />
                        <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">Números Mágicos!</span>
                    </h1>

                    <div className="space-y-4 text-slate-100 leading-relaxed">
                        <p className="text-base">
                            Sabemos exatamente o que dizem as estatísticas: a probabilidade de acertar na chave vencedora do Euromilhões é <strong className="text-amber-300">infinitesimal</strong> (cerca de 1 em 139 milhões, para sermos precisos). É uma agulha num palheiro cósmico.
                        </p>

                        <div className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
                            <p className="text-amber-200 font-semibold mb-2">Por isso, vamos ser claros desde o primeiro instante:</p>
                            <p className="text-sm text-slate-300">
                                Este site <strong>não vende fórmulas mágicas</strong> nem <strong>garante prémios</strong>. Acreditamos, genuinamente, que ganhar o Euromilhões é, acima de tudo, uma questão de pura sorte.
                            </p>
                        </div>

                        <p>
                            <strong>No entanto</strong>, somos fascinados pelos números. Gostamos de os observar, dissecar e analisar sob um prisma matemático, estatístico e fora da caixa.
                        </p>

                        <p>
                            <strong className="text-amber-300">O nosso objetivo?</strong> Tentar encontrar padrões no caos.
                        </p>

                        <p className="text-slate-200">
                            Se, através das nossas análises, conseguirmos reduzir o universo dos 50 números e das estrelas para um lote mais restrito e "provável", já ficamos contentes.
                        </p>

                        <p className="text-sm text-slate-400 italic">
                            E, mesmo que a ciência nos diga que cada sorteio é um evento independente, nós gostamos de acreditar que é possível chegar lá.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-slate-700/50">
                        <p className="text-amber-300 font-semibold">
                            Entre, explore as nossas estatísticas e divirta-se a analisar o jogo connosco. 🎲
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10 bg-slate-950">
                <div className="max-w-md mx-auto w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white drop-shadow-lg font-serif">Entrar na Plataforma</h2>
                        <p className="text-slate-400 mt-2">Aceda às análises estatísticas</p>
                    </div>

                    <Card className="p-6 bg-slate-900/50 backdrop-blur-md border-slate-800 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* Wizard Image */}
                        <div className="relative z-10 mb-6 flex justify-center">
                            <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10">
                                <Image
                                    src="/wizard-entry.jpg"
                                    alt="Números Mágicos"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* Disclaimer Checkbox - MANDATORY */}
                            <div className="flex items-start gap-3 pt-2 border-t border-slate-700/50">
                                <input
                                    type="checkbox"
                                    id="disclaimer"
                                    checked={agreedToDisclaimer}
                                    onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
                                    className="w-5 h-5 mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-600 focus:ring-amber-500"
                                    disabled={loading}
                                />
                                <label htmlFor="disclaimer" className="text-sm text-slate-300 leading-relaxed">
                                    <strong className="text-amber-400">Aceito que não existem garantias de ganhos</strong> e
                                    que o site não se responsabiliza por perdas financeiras.
                                    {' '}
                                    <a href="/about" target="_blank" className="text-blue-400 hover:text-blue-300 underline">
                                        Sobre Nós
                                    </a>
                                    {' | '}
                                    <a href="/responsible-gaming" target="_blank" className="text-blue-400 hover:text-blue-300 underline">
                                        Jogo Responsável
                                    </a>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 border border-blue-500/20"
                            >
                                {loading ? 'A entrar...' : 'Entrar'}
                            </button>
                        </form>

                        <div className="mt-6 text-center space-y-2 relative z-10">
                            <Link href="/register" className="block text-blue-400 hover:text-blue-300 text-sm transition-colors">
                                Criar conta gratuita
                            </Link>
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
