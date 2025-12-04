'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would send an email via API
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">Contacte-nos</h1>
                    </div>

                    <Card className="p-6 md:p-8">
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                    ✅
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Mensagem Enviada!</h2>
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    Obrigado pelo seu contacto. Responderemos o mais brevemente possível.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nome</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Seu nome"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="seu@email.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mensagem</label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Como podemos ajudar?"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Enviar Mensagem
                                </button>
                            </form>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
