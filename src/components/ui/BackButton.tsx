import Link from 'next/link';

interface BackButtonProps {
    href?: string;
    label?: string;
}

interface BackButtonProps {
    href?: string;
    label?: string;
    className?: string;
    iconClassName?: string;
    style?: React.CSSProperties;
}

export default function BackButton({ href = '/', label = 'Voltar', className = '', iconClassName = '', style = {} }: BackButtonProps) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-center w-10 h-10 rounded-lg bg-surface-1/50 text-muted-foreground hover:bg-surface-2 transition-all ${className}`} style={style}
            title={label}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className={iconClassName || "w-5 h-5"} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
    );
}
