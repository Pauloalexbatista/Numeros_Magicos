import Link from 'next/link';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CardCategory = 'dashboard' | 'numbers' | 'stars';
export type CardVariant = 'free' | 'pro' | 'premium' | 'admin';

interface UnifiedCardProps {
    // Content
    title: string;
    description?: string;
    icon?: LucideIcon;

    // Styling
    category: CardCategory;
    variant?: CardVariant;
    gridSpan?: 1 | 2 | 3 | 4;

    // Navigation
    href: string;
    isLocked?: boolean;

    // Optional
    badge?: string;
    children?: ReactNode;
    className?: string;
}

const categoryStyles: Record<CardCategory, string> = {
    dashboard: `
    bg-gradient-to-br from-blue-50 to-blue-100 
    dark:from-blue-950 dark:to-blue-900
    border-blue-200 dark:border-blue-800
    hover:from-blue-100 hover:to-blue-150
    dark:hover:from-blue-900 dark:hover:to-blue-800
    hover:border-blue-300 dark:hover:border-blue-700
  `,
    numbers: `
    bg-gradient-to-br from-green-50 to-green-100
    dark:from-green-950 dark:to-green-900
    border-green-200 dark:border-green-800
    hover:from-green-100 hover:to-green-150
    dark:hover:from-green-900 dark:hover:to-green-800
    hover:border-green-300 dark:hover:border-green-700
  `,
    stars: `
    bg-gradient-to-br from-yellow-50 to-yellow-100
    dark:from-yellow-950 dark:to-yellow-900
    border-yellow-200 dark:border-yellow-800
    hover:from-yellow-100 hover:to-yellow-150
    dark:hover:from-yellow-900 dark:hover:to-yellow-800
    hover:border-yellow-300 dark:hover:border-yellow-700
  `
};

const categoryIconColors: Record<CardCategory, string> = {
    dashboard: 'text-blue-600 dark:text-blue-400',
    numbers: 'text-green-600 dark:text-green-400',
    stars: 'text-yellow-600 dark:text-yellow-400'
};

const categoryBadgeColors: Record<CardCategory, string> = {
    dashboard: 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
    numbers: 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200',
    stars: 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
};

const variantBadgeText: Record<CardVariant, string> = {
    free: 'Grátis',
    pro: 'PRO',
    premium: 'Premium',
    admin: 'Admin'
};

const gridSpanClasses: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 lg:col-span-3',
    4: 'col-span-1 md:col-span-2 lg:col-span-4'
};

export default function UnifiedCard({
    title,
    description,
    icon: Icon,
    category,
    variant = 'free',
    gridSpan = 1,
    href,
    isLocked = false,
    badge,
    children,
    className
}: UnifiedCardProps) {
    const categoryStyle = categoryStyles[category];
    const iconColor = categoryIconColors[category];
    const badgeColor = categoryBadgeColors[category];
    const gridClass = gridSpanClasses[gridSpan];

    const CardContent = (
        <div
            className={cn(
                // Base styles
                'relative rounded-2xl border-2 p-6',
                'transition-all duration-300 ease-in-out',
                'shadow-sm hover:shadow-xl',
                'transform hover:scale-105 hover:-translate-y-1',

                // Category styles
                categoryStyle,

                // Locked state
                isLocked && 'opacity-75 cursor-not-allowed',

                // Custom className
                className
            )}
        >
            {/* Locked Overlay */}
            {isLocked && (
                <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 rounded-2xl flex items-center justify-center z-10">
                    <div className="text-center">
                        <svg
                            className="w-12 h-12 mx-auto mb-2 text-zinc-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                            Bloqueado
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className={cn('p-2 rounded-lg bg-white/50 dark:bg-black/50', iconColor)}>
                            <Icon className="w-6 h-6" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight">
                            {title}
                        </h3>
                        {badge && (
                            <span className={cn(
                                'inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                                badgeColor
                            )}>
                                {badge}
                            </span>
                        )}
                    </div>
                </div>

                {/* Variant Badge */}
                {variant !== 'free' && (
                    <span className={cn(
                        'px-2 py-1 rounded-md text-xs font-bold uppercase',
                        variant === 'pro' && 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
                        variant === 'premium' && 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
                        variant === 'admin' && 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    )}>
                        {variantBadgeText[variant]}
                    </span>
                )}
            </div>

            {/* Description */}
            {description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                    {description}
                </p>
            )}

            {/* Children (optional custom content) */}
            {children}

            {/* Arrow Icon */}
            <div className={cn(
                'absolute bottom-4 right-4 transition-transform',
                'group-hover:translate-x-1',
                iconColor
            )}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );

    // If locked, don't make it a link
    if (isLocked) {
        return <div className={gridClass}>{CardContent}</div>;
    }

    // Normal link card
    return (
        <div className={gridClass}>
            <Link href={href} className="group block">
                {CardContent}
            </Link>
        </div>
    );
}
