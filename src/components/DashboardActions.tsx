'use client';

interface DashboardActionsProps {
    updateDataAction: () => Promise<void>;
    isAdmin?: boolean;
}

export default function DashboardActions({ updateDataAction, isAdmin = false }: DashboardActionsProps) {
    // Only show for admins
    if (!isAdmin) return null;

    return (
        <div className="flex gap-2">
            <form action={updateDataAction}>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all hover:shadow-md"
                >
                    🔄 Atualizar Dados
                </button>
            </form>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-200 rounded-md hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 shadow-sm transition-all hover:shadow-md"
                title="Recarregar página para aplicar atualizações"
            >
                ↻ Recarregar
            </button>
        </div>
    );
}
