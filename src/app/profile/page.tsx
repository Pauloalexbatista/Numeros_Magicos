import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BackButton } from "@/components/ui";
import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-geist-sans)]">
            <div className="p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-3xl font-bold">O Meu Perfil</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* User Info */}
                        <Card className="p-6 space-y-6">
                            <h2 className="text-xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                Dados da Conta
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-zinc-500 dark:text-zinc-400">Nome</label>
                                    <p className="font-medium text-lg">{session.user.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-zinc-500 dark:text-zinc-400">Email</label>
                                    <p className="font-medium text-lg">{session.user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-zinc-500 dark:text-zinc-400">Tipo de Conta</label>
                                    <div className="mt-1">
                                        <span className={`
                                            px-3 py-1 rounded-full text-sm font-bold
                                            ${(session.user as any).role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                (session.user as any).role === 'PRO' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}
                                        `}>
                                            {(session.user as any).role || 'USER'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Change Password */}
                        <Card className="p-6 space-y-6">
                            <h2 className="text-xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                Alterar Password
                            </h2>
                            <ChangePasswordForm email={session.user.email!} />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
