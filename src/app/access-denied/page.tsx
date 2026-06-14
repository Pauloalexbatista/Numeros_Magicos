import Link from 'next/link';

export default function AccessDeniedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface-1 text-foreground p-4">
            <div className="max-w-md text-center space-y-6">
                <div className="text-6xl">🚫</div>
                <h1 className="text-3xl font-bold text-red-600">Acesso Negado</h1>
                <p className="text-muted-foreground">
                    Não tens permissão para aceder a esta página.
                    Esta área é reservada para administradores.
                </p>
                <div className="flex justify-center gap-4">
                    <Link
                        href="/"
                        className="px-6 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Voltar ao Início
                    </Link>
                </div>
            </div>
        </div>
    );
}
