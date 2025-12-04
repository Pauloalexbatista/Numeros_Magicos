import Link from 'next/link';

interface ToolCardProps {
    href: string;
    icon: string;
    title: string;
    subtitle: string;
    tier: 'free' | 'pro' | 'essential';
    badge?: string;
}

export default function ToolCard({ href, icon, title, subtitle, tier, badge }: ToolCardProps) {
    // Define styles based on tier
    const styles = {
        free: {
            container: "group flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all hover:shadow-md",
            icon: "text-3xl mb-2 group-hover:scale-110 transition-transform",
            title: "font-semibold text-zinc-900 dark:text-zinc-100",
            subtitle: "text-xs text-zinc-500 dark:text-zinc-400 mt-1"
        },
        pro: {
            container: "group flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md border-2 border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-lg hover:scale-[1.02]",
            icon: "text-3xl mb-2 group-hover:scale-110 transition-transform",
            title: "font-semibold text-zinc-900 dark:text-zinc-100",
            subtitle: "text-xs text-zinc-500 dark:text-zinc-400 mt-1"
        },
        essential: {
            container: "group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl shadow-lg border-2 border-amber-400 dark:border-amber-600 hover:border-amber-500 dark:hover:border-amber-500 transition-all hover:shadow-xl hover:scale-[1.03] ring-2 ring-amber-200 dark:ring-amber-800",
            icon: "text-4xl mb-2 group-hover:scale-110 transition-transform",
            title: "font-bold text-lg text-amber-900 dark:text-amber-100",
            subtitle: "text-xs text-zinc-600 dark:text-zinc-400 mt-2 text-center"
        }
    };

    const currentStyle = styles[tier];

    return (
        <Link href={href} className={currentStyle.container}>
            <span className={currentStyle.icon}>{icon}</span>
            <span className={currentStyle.title}>{title}</span>
            {badge && (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-300 mt-1 bg-white dark:bg-black/20 px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
            <span className={currentStyle.subtitle}>{subtitle}</span>
        </Link>
    );
}
