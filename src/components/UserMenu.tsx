import Link from "next/link";
import Image from "next/image";
import { handleSignOut } from "./SignOutAction";

export default function UserMenu({ session }: { session: any }) {
    return (
        <nav className="sticky top-0 z-[100] w-full bg-[#1a0b2e]/90 backdrop-blur-md border-b border-purple-900/50 px-6 py-3 flex justify-between items-center shadow-[0_0_15px_rgba(147,51,234,0.1)]">
            <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                    <Image src="/crystal-ball.jpg" alt="Bola de Cristal" fill className="object-cover" />
                </div>
                <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(168,85,247,0.5)] font-serif">
                    Números Mágicos
                </div>
            </div>

            <div className="flex items-center gap-4">
                {!session?.user ? (
                    <Link href="/login" className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_10px_rgba(147,51,234,0.3)] border border-purple-500/20">
                        Entrar
                    </Link>
                ) : (
                    <>
                        <div className="hidden md:flex flex-col items-end text-sm">
                            <div className="font-bold text-zinc-100">{session.user.name}</div>
                            <div className="text-xs text-purple-300">{session.user.email}</div>
                        </div>

                        {session.user.image && <img src={session.user.image} alt="" className="w-9 h-9 rounded-full border border-purple-500/30 shadow-[0_0_5px_rgba(168,85,247,0.3)]" />}

                        <div className="flex items-center gap-2 pl-2 border-l border-purple-800/50">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${session.user.role === 'ADMIN' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                session.user.role === 'PRO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                    'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                }`}>
                                {session.user.role}
                            </span>

                            {session.user.role === 'ADMIN' && (
                                <Link href="/admin" className="text-xs bg-purple-900/50 text-purple-100 px-3 py-1.5 rounded font-medium hover:bg-purple-800/50 transition-colors border border-purple-700/50">
                                    Admin
                                </Link>
                            )}

                            <form action={handleSignOut}>
                                <button type="submit" className="text-xs bg-zinc-800/50 text-zinc-300 px-3 py-1.5 rounded font-medium hover:bg-zinc-700/50 transition-colors border border-zinc-700/50">
                                    Sair
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}
