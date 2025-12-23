'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * EntryGuard - Ensures users see the entry page (/login) first
 * before accessing any other page in the application.
 * Only runs on client-side to avoid hydration issues.
 */
export default function EntryGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Only run on client-side after component is mounted
        if (!mounted) return;

        // Check if user has accepted terms
        const termsAccepted = localStorage.getItem('termsAccepted');

        // If not on login page and terms not accepted, redirect to login
        if (pathname !== '/login' && !termsAccepted) {
            router.push('/login');
        }
    }, [pathname, router, mounted]);

    // Don't render children until mounted to avoid hydration mismatch
    if (!mounted) {
        return null;
    }

    return <>{children}</>;
}
