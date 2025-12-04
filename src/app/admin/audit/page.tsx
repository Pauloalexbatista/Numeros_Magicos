import AuditResultsTable from '@/components/admin/AuditResultsTable';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';

export const dynamic = 'force-dynamic';

export default function AuditPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    Auditoria de Sistemas
                </h1>
                <p className="text-slate-400">
                    Verifique a integridade dos cálculos comparando previsões guardadas com recálculos em tempo real.
                </p>
            </div>

            <AuditResultsTable />
            <ResponsibleGamingFooter />
        </div>
    );
}
