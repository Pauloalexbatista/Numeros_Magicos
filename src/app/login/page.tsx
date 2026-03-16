'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
    const [error, setError] = useState('');

    const handleAccept = () => {
        console.log('Button clicked! Checkbox state:', agreedToDisclaimer);

        if (!agreedToDisclaimer) {
            setError('Tem de aceitar o disclaimer antes de continuar.');
            return;
        }

        console.log('Redirecting to /games...');
        // Redirect to game selection (no localStorage, must accept every time)
        router.push('/games');
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row relative overflow-hidden">
            {/* Left Side - Welcome Message */}
            <div className="w-full md:w-1/2 relative overflow-hidden flex flex-col justify-start p-8 md:p-12 lg:p-16 pt-12 md:pt-20 lg:pt-28 bg-white border-r border-slate-200">
                <div className="max-w-xl mx-auto space-y-7">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight text-[#2D3748]">
                        Bem-vindo aos <br />
                        <span className="text-[#1A5276]">Números Mágicos!</span>
                    </h1>

                    <div className="space-y-4 text-[#2D3748] leading-relaxed">
                        <p className="text-base">
                            Sabemos exatamente o que dizem as estatísticas: a probabilidade de acertar na chave vencedora do Euromilhões é <strong className="text-[#1A5276]">infinitesimal</strong> (cerca de 1 em 139 milhões, para sermos precisos). É uma agulha num palheiro cósmico.
                        </p>

                        <div className="bg-[#F8F9FA] p-4 rounded-lg border border-slate-200">
                            <p className="text-slate-700 font-semibold mb-2">Por isso, vamos ser claros desde o primeiro instante:</p>
                            <p className="text-sm text-slate-600">
                                Este site <strong>não vende fórmulas mágicas</strong> nem <strong>garante prémios</strong>. Acreditamos, genuinamente, que ganhar o Euromilhões é, acima de tudo, uma questão de pura sorte.
                            </p>
                        </div>

                        <p>
                            <strong>No entanto</strong>, somos fascinados pelos números. Gostamos de os observar, dissecar e analisar sob um prisma matemático, estatístico e fora da caixa.
                        </p>

                        <p>
                            <strong className="text-[#1A5276]">O nosso objetivo?</strong> Tentar encontrar padrões no caos.
                        </p>

                        <p className="text-slate-600">
                            Se, através das nossas análises, conseguirmos reduzir o universo dos 50 números e das estrelas para um lote mais restrito e "provável", já ficamos contentes.
                        </p>

                        <p className="text-sm text-slate-500 italic">
                            E, mesmo que a ciência nos diga que cada sorteio é um evento independente, nós gostamos de acreditar que é possível chegar lá.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                        <p className="text-[#1A5276] font-semibold">
                            Entre, explore as nossas estatísticas e divirta-se a analisar o jogo connosco. 🎲
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Responsibility Disclaimer */}
            <div className="w-full md:w-1/2 flex flex-col justify-start p-8 md:p-12 lg:p-16 pt-12 md:pt-20 lg:pt-28 bg-[#F8F9FA]">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="flex items-center justify-center gap-4 mb-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <div className="p-2 bg-amber-100 rounded-full shrink-0 flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="text-left flex items-baseline gap-3">
                            <h2 className="text-xl font-bold text-[#2D3748]">Aviso Importante</h2>
                            <p className="text-amber-700 text-sm font-semibold">- Jogo Responsável</p>
                        </div>
                    </div>

                    <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-200 relative">
                        {/* Disclaimer Content */}
                        <div className="space-y-4 text-[#2D3748] mb-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {/* Section 1 */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                                <h3 className="text-xl font-bold text-[#1A5276] mb-3 flex items-center gap-2">
                                    <span>📊</span> Natureza Estatística
                                </h3>
                                <p className="leading-relaxed text-base text-slate-700">
                                    Este site (<strong>"Números Mágicos"</strong>) é uma ferramenta de <strong>análise estatística e matemática</strong>.
                                    Todas as previsões são baseadas em algoritmos, padrões históricos e probabilidades, mas <strong className="text-[#1A5276]">não garantem resultados futuros</strong>.
                                </p>
                            </div>

                            {/* Section 2 */}
                            <div className="bg-red-50 border border-red-100 rounded-lg p-5">
                                <h3 className="text-xl font-bold text-red-700 mb-3 flex items-center gap-2">
                                    <span>⚠️</span> Sem Garantias de Ganhos
                                </h3>
                                <p className="leading-relaxed mb-3 text-base text-slate-700">
                                    <strong>Não oferecemos fórmulas mágicas nem garantimos prémios</strong>. A probabilidade de ganhar o jackpot do Euromilhões é de aproximadamente <strong className="text-red-700">1 em 139 milhões</strong>.
                                </p>
                                <p className="leading-relaxed text-sm text-slate-600">
                                    Cada sorteio é um evento independente e aleatório. O uso das informações aqui contidas é de sua <strong>inteira responsabilidade</strong>.
                                </p>
                            </div>

                            {/* Section 3 */}
                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-5">
                                <h3 className="text-xl font-bold text-orange-700 mb-3 flex items-center gap-2">
                                    <span>🎲</span> Jogo Responsável
                                </h3>
                                <ul className="space-y-3 leading-relaxed text-base text-slate-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-1">•</span>
                                        <span>Jogue apenas se for <strong>maior de 18 anos</strong></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-1">•</span>
                                        <span>Estabeleça <strong>limites de gastos</strong> e respeite-os</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-1">•</span>
                                        <span>Nunca aposte dinheiro que não pode perder</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-1">•</span>
                                        <span>O jogo deve ser <strong>entretenimento</strong>, não rendimento</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Section 4 */}
                            <div className="bg-red-100 border border-red-200 rounded-lg p-5">
                                <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
                                    <span>🚨</span> Risco de Dependência
                                </h3>
                                <p className="leading-relaxed mb-3 text-base text-slate-700">
                                    <strong>O jogo pode causar dependência</strong>. Se sentir que está a perder o controlo, procure ajuda imediatamente.
                                </p>
                                <p className="text-sm text-slate-600">
                                    Linha de Apoio ao Jogador: <strong className="text-[#2D3748]">+351 213 587 000</strong>
                                </p>
                            </div>
                        </div>

                        {/* Disclaimer Checkbox */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-medium mb-4">
                                {error}
                            </div>
                        )}

                        <div className="flex items-start gap-3 pt-4 mb-6 border-t border-slate-200">
                            <input
                                type="checkbox"
                                id="disclaimer"
                                checked={agreedToDisclaimer}
                                onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
                                className="w-5 h-5 mt-0.5 rounded border-slate-300 text-[#1A5276] focus:ring-[#1A5276]"
                            />
                            <label htmlFor="disclaimer" className="text-sm text-[#2D3748] leading-relaxed">
                                <strong className="text-[#1A5276]">Aceito que não existem garantias de ganhos</strong> e
                                que o site não se responsabiliza por perdas financeiras.
                                {' '}
                                <Link href="/about" className="text-[#1A5276] hover:underline">
                                    Sobre Nós
                                </Link>
                                {' | '}
                                <Link href="/responsible-gaming" className="text-[#1A5276] hover:underline">
                                    Jogo Responsável
                                </Link>
                            </label>
                        </div>

                        <button
                            type="button"
                            onClick={handleAccept}
                            className="w-full bg-[#1A5276] hover:bg-[#154360] text-white font-bold py-4 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3 text-lg relative z-10 cursor-pointer"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Li, Compreendi e Aceito - Entrar</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <Link href="/contact" className="text-slate-600 hover:text-[#1A5276] text-sm transition-colors">
                            Precisa de ajuda? Contacte-nos
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
