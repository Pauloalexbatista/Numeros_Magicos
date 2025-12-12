'use client';

import { useState } from 'react';
import { Mail, Send, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Reportar Erro',
        message: ''
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Falha ao enviar mensagem');
            }

            setStatus('success');
            setFormData({ name: '', email: '', subject: 'Reportar Erro', message: '' });
        } catch (error: any) {
            console.error(error);
            if (error.name === 'AbortError') {
                alert('O envio demorou demasiado tempo. Verifique a sua conexão.');
            }
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar à Página Inicial
                    </Link>

                    <div className="text-center">
                        <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Contacte-nos</h1>
                        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                            Encontrou um erro, tem uma sugestão ou quer apenas dizer olá?
                            <br />Preencha o formulário abaixo.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {status === 'success' && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                                    ✅
                                </div>
                                <div>
                                    <p className="font-bold">Mensagem enviada!</p>
                                    <p className="text-sm opacity-90">Obrigado pelo seu contacto. Responderemos em breve.</p>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                ❌ Erro ao enviar. Por favor, tente novamente.
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    Nome
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Seu nome"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    Email
                                </label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Assunto
                            </label>
                            <select
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            >
                                <option value="Reportar Erro">🐞 Reportar um Erro</option>
                                <option value="Sugestão">💡 Sugestão de Melhoria</option>
                                <option value="Dúvida">❓ Dúvida Geral</option>
                                <option value="Outro">💬 Outro Assunto</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Mensagem
                            </label>
                            <textarea
                                required
                                rows={6}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                placeholder="Descreva pormenorizadamente o erro ou a sua sugestão..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" /> A Enviar...
                                </>
                            ) : (
                                <>
                                    <Send className="w-6 h-6" /> Enviar Mensagem
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
