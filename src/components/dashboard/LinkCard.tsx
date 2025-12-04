import Link from 'next/link';
import React from 'react';

interface LinkCardProps {
    href: string;
    icon: string;
    title: string;
    description: string;
    colorTheme?: string; // 'emerald', 'amber', 'purple', etc.
    isPremium?: boolean;
    badgeText?: string;
    badgeColor?: string;
    variant?: 'dark' | 'light' | 'neutral' | 'pro' | 'admin';
}

const colorMap: Record<string, string> = {
    emerald: 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600',
    amber: 'border-amber-400 dark:border-amber-600 hover:border-amber-500 dark:hover:border-amber-500 ring-amber-200 dark:ring-amber-800',
    yellow: 'border-yellow-400 dark:border-yellow-600 hover:border-yellow-500 dark:hover:border-yellow-500 ring-yellow-200 dark:ring-yellow-800',
    purple: 'border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-400',
    indigo: 'border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 dark:hover:border-indigo-400',
    teal: 'border-teal-300 dark:border-teal-700 hover:border-teal-500 dark:hover:border-teal-400',
    blue: 'border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-400',
    orange: 'border-orange-300 dark:border-orange-700 hover:border-orange-500 dark:hover:border-orange-400',
    cyan: 'border-cyan-300 dark:border-cyan-700 hover:border-cyan-500 dark:hover:border-cyan-400',
    zinc: 'border-zinc-300 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-400',
    rose: 'border-rose-300 dark:border-rose-700 hover:border-rose-500 dark:hover:border-rose-400',
    sky: 'border-sky-300 dark:border-sky-700 hover:border-sky-500 dark:hover:border-sky-400',
    violet: 'border-violet-300 dark:border-violet-700 hover:border-violet-500 dark:hover:border-violet-400',
    pink: 'border-pink-300 dark:border-pink-700 hover:border-pink-500 dark:hover:border-pink-400',
    green: 'border-green-300 dark:border-green-700 hover:border-green-500 dark:hover:border-green-400',
};

export default function LinkCard({
    href,
    icon,
    title,
    description,
    colorTheme = 'emerald',
    isPremium = false,
    badgeText,
    badgeColor,
    variant = 'light'
}: LinkCardProps) {
    const borderClass = colorMap[colorTheme] || colorMap['emerald'];
    const shadowClass = isPremium ? 'shadow-md hover:shadow-lg hover:scale-[1.02] ring-2' : 'shadow-sm hover:shadow-md';
    const borderWidth = isPremium ? 'border-2' : 'border';

    // Variant Styles
    const variantStyles = {
        dark: 'bg-indigo-950 border-indigo-900 text-white hover:bg-indigo-900',
        light: `bg-white dark:bg-zinc-900 ${borderClass} text-zinc-900 dark:text-zinc-100`, // Default
        neutral: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',

        // NEW VARIANTS
        pro: 'bg-blue-950 border-amber-500/50 text-amber-50 hover:bg-blue-900 hover:border-amber-400 shadow-amber-900/20',
        admin: 'bg-zinc-900 border-red-900/50 text-red-50 hover:bg-zinc-800 hover:border-red-500/50 shadow-red-900/10'
    };

    const baseClass = variantStyles[variant] || variantStyles.light;

    // Specific text colors for variants
    const titleColor = variant === 'pro' ? 'text-amber-400' :
        variant === 'admin' ? 'text-red-400' :
            variant === 'dark' ? 'text-white' :
                'text-zinc-900 dark:text-zinc-100';

    const descColor = variant === 'pro' ? 'text-blue-200' :
        variant === 'admin' ? 'text-zinc-400' :
            variant === 'dark' ? 'text-indigo-200' :
                'text-zinc-500 dark:text-zinc-400';

    return (
        <Link
            href={href}
            className={`group flex flex-col items-center justify-center p-6 rounded-xl ${shadowClass} ${borderWidth} ${baseClass} transition-all h-full min-h-[160px] relative overflow-hidden`}
        >
            {/* Background Glow for PRO */}
            {variant === 'pro' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
            )}

            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform filter drop-shadow-sm">{icon}</span>

            <span className={`font-bold text-lg text-center leading-tight ${titleColor}`}>
                {title}
            </span>

            {badgeText && (
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor || 'bg-zinc-100 text-zinc-600'}`}>
                    {badgeText}
                </span>
            )}

            <span className={`text-xs mt-2 text-center font-medium ${descColor}`}>
                {description}
            </span>
        </Link>
    );
}
