import React from 'react';
import Link from 'next/link';
import { HistoryTable } from '@/components/HistoryTable';
import { Draw } from '@/lib/types';

interface HistoryWidgetProps {
    recentDraws: Draw[];
}

export default function HistoryWidget({ recentDraws }: HistoryWidgetProps) {
    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Ultimos 10 Resultados</h2>
                <Link href="/history" className="text-sm font-medium text-accent hover:brightness-110">
                    Ver Todos →
                </Link>
            </div>
            <HistoryTable initialDraws={recentDraws.map(d => ({
                ...d,
                date: (d.date as any) instanceof Date ? (d.date as any).toISOString() : d.date,
                numbers: d.numbers,
                stars: d.stars,
                numbersDrawOrder: d.numbersDrawOrder,
                starsDrawOrder: d.starsDrawOrder
            }))} />
        </section>
    );
}