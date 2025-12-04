import Link from 'next/link';

interface BackButtonProps {
    href?: string;
    label?: string;
}

export default function BackButton({ href = '/', label = 'Voltar' }: BackButtonProps) {
    return (
        <Link
            href={href}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            title={label}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
    );
}
