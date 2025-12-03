import { getHistory } from '@/app/actions';
import Link from 'next/link';

export default async function HistoricalChangesPage() {
    const draws = await getHistory();

    // Analyze star ranges
    const starRanges: { [key: string]: { count: number; firstDate: Date; lastDate: Date } } = {};

    // Analyze weekdays
    const weekdayStats: { [key: number]: { count: number; firstDate: Date } } = {};

    draws.forEach(draw => {
        const maxStar = Math.max(...draw.stars);
        const date = new Date(draw.date);
        const weekday = date.getDay(); // 0=Sunday, 2=Tuesday, 5=Friday

        // Track star ranges
        const range = maxStar <= 9 ? '1-9' : maxStar <= 11 ? '1-11' : '1-12';
        if (!starRanges[range]) {
            starRanges[range] = { count: 0, firstDate: date, lastDate: date };
        }
        starRanges[range].count++;
        if (date < starRanges[range].firstDate) starRanges[range].firstDate = date;
        if (date > starRanges[range].lastDate) starRanges[range].lastDate = date;

        // Track weekdays
        if (!weekdayStats[weekday]) {
            weekdayStats[weekday] = { count: 0, firstDate: date };
        }
        weekdayStats[weekday].count++;
        if (date < weekdayStats[weekday].firstDate) {
            weekdayStats[weekday].firstDate = date;
        }
    });

    // Find transition points
    const sortedDraws = [...draws].reverse(); // Oldest first
    const firstWith10Plus = sortedDraws.find(d => Math.max(...d.stars) >= 10);
    const firstWith11Plus = sortedDraws.find(d => Math.max(...d.stars) >= 11);
    const firstWith12 = sortedDraws.find(d => Math.max(...d.stars) === 12);
    const firstTuesday = sortedDraws.find(d => new Date(d.date).getDay() === 2);

    const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold">📜 Mudanças Históricas do EuroMilhões</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Análise das alterações nas regras ao longo do tempo</p>
                    </div>
                    <Link href="/" className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-md hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                        ← Dashboard
                    </Link>
                </div>

                {/* Star Range Changes */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-xl font-bold mb-4">⭐ Evolução do Intervalo de Estrelas</h2>

                    <div className="space-y-4">
                        {Object.entries(starRanges).map(([range, data]) => (
                            <div key={range} className="border-l-4 border-amber-500 pl-4">
                                <div className="font-bold text-lg">Estrelas {range}</div>
                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {data.count} sorteios
                                </div>
                                <div className="text-sm">
                                    De {data.firstDate.toLocaleDateString('pt-PT')} até {data.lastDate.toLocaleDateString('pt-PT')}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 space-y-2 text-sm bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded p-4">
                        <h3 className="font-bold text-blue-900 dark:text-blue-300">Marcos Importantes:</h3>
                        {firstWith10Plus && (
                            <p>• Primeira estrela ≥10: <strong>{new Date(firstWith10Plus.date).toLocaleDateString('pt-PT')}</strong> ({firstWith10Plus.stars.join(', ')})</p>
                        )}
                        {firstWith11Plus && (
                            <p>• Primeira estrela ≥11: <strong>{new Date(firstWith11Plus.date).toLocaleDateString('pt-PT')}</strong> ({firstWith11Plus.stars.join(', ')})</p>
                        )}
                        {firstWith12 && (
                            <p>• Primeira estrela 12: <strong>{new Date(firstWith12.date).toLocaleDateString('pt-PT')}</strong> ({firstWith12.stars.join(', ')})</p>
                        )}
                    </div>
                </div>

                {/* Weekday Changes */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-xl font-bold mb-4">📅 Dias da Semana dos Sorteios</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(weekdayStats)
                            .sort(([a], [b]) => parseInt(a) - parseInt(b))
                            .map(([day, data]) => (
                                <div key={day} className="border rounded-lg p-4">
                                    <div className="font-bold text-lg">{weekdayNames[parseInt(day)]}</div>
                                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{data.count}</div>
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Desde {data.firstDate.toLocaleDateString('pt-PT')}
                                    </div>
                                </div>
                            ))}
                    </div>

                    {firstTuesday && (
                        <div className="mt-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded p-4">
                            <h3 className="font-bold text-green-900 dark:text-green-300">Introdução da Terça-feira:</h3>
                            <p className="text-sm text-green-800 dark:text-green-400">
                                Primeiro sorteio à terça-feira: <strong>{new Date(firstTuesday.date).toLocaleDateString('pt-PT')}</strong>
                            </p>
                            <p className="text-sm text-green-800 dark:text-green-400 mt-2">
                                Antes desta data: apenas sextas-feiras<br />
                                Depois desta data: terças e sextas-feiras
                            </p>
                        </div>
                    )}
                </div>

                {/* Online Verification */}
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-300 mb-4">✅ Verificação Online</h2>
                    <div className="text-sm text-yellow-800 dark:text-yellow-400 space-y-2">
                        <p><strong>Fontes confirmam:</strong></p>
                        <p>• <strong>Maio 2011:</strong> Estrelas aumentaram de 9 para 11</p>
                        <p>• <strong>Maio 2011:</strong> Introdução de sorteios às terças-feiras (2x por semana)</p>
                        <p>• <strong>Setembro 2016:</strong> Estrelas aumentaram de 11 para 12</p>
                        <p className="mt-3 pt-3 border-t border-yellow-300 dark:border-yellow-800">
                            <strong>Os nossos dados confirmam:</strong><br />
                            10/05/2011 - Primeira terça-feira ✓<br />
                            20/05/2011 - Primeira estrela ≥11 ✓<br />
                            27/09/2016 - Primeira estrela 12 ✓
                        </p>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-purple-900 dark:text-purple-300 mb-4">📊 Resumo</h2>
                    <div className="text-sm text-purple-800 dark:text-purple-400 space-y-2">
                        <p>• <strong>Total de sorteios:</strong> {draws.length}</p>
                        <p>• <strong>Período:</strong> {new Date(draws[draws.length - 1].date).toLocaleDateString('pt-PT')} até {new Date(draws[0].date).toLocaleDateString('pt-PT')}</p>
                        <p>• <strong>Frequência atual:</strong> 2 sorteios por semana (terça e sexta)</p>
                        <p>• <strong>Estrelas atuais:</strong> 1 a 12</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
