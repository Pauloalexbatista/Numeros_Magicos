import { prisma } from '@/lib/prisma';
import { MeanReversionClient } from '@/components/MeanReversionClient';

export default async function MeanReversionPage() {
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 200 // Analyze last 200 draws
    });

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-100">
                    📉 Análise de Regressão à Média
                </h1>
                <p className="text-slate-400">
                    Estudo da força da média na 1ª e 2ª Casa e a sua correlação.
                </p>
            </div>

            <MeanReversionClient draws={draws} />
        </div>
    );
}
