import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { BackButton } from '@/components/ui';
import { Card } from '@/components/ui/card';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-surface-1 text-foreground font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="mx-auto max-w-4xl space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">O Meu Perfil</h1>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card className="p-6 space-y-6">
                            <h2 className="text-xl font-bold border-b border-border pb-2">Dados da Conta</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-muted-foreground">Nome</label>
                                    <p className="text-lg font-medium">{session.user.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Email</label>
                                    <p className="text-lg font-medium">{session.user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Tipo de Conta</label>
                                    <div className="mt-1">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                (session.user as any).role === 'ADMIN'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    : (session.user as any).role === 'PRO'
                                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}
                                        >
                                            {(session.user as any).role || 'USER'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 space-y-6">
                            <h2 className="text-xl font-bold border-b border-border pb-2">Alterar Password</h2>
                            <ChangePasswordForm email={session.user.email!} />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
