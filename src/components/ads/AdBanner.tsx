'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
    slot?: string;
    format?: 'vertical' | 'horizontal' | 'rectangle' | 'auto';
    className?: string;
    label?: string;
}

declare global {
    interface Window {
        adsbygoogle?: any[];
    }
}

export default function AdBanner({
    slot = '',
    format = 'auto',
    className = '',
    label = 'Publicidade',
}: AdBannerProps) {
    const adLoaded = useRef(false);
    const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-9370511080311319';
    // Um slot manual do Google AdSense é sempre numérico (ex: "1234567890").
    // Enquanto usamos Auto Ads (ou antes de criar unidades manuais numéricas), mostramos o placeholder limpo
    // sem disparar um iframe com ID inválido.
    const hasNumericSlot = /^\d+$/.test(slot);

    useEffect(() => {
        if (!clientId || !hasNumericSlot || adLoaded.current) return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            adLoaded.current = true;
        } catch {
            // AdSense script not ready or blocked by browser adblocker
        }
    }, [clientId, hasNumericSlot]);

    const sizeClasses =
        format === 'vertical'
            ? 'w-[300px] h-[600px]'
            : format === 'horizontal'
            ? 'w-full max-w-[728px] h-[90px]'
            : 'w-full max-w-[336px] h-[280px]';

    if (!clientId || !hasNumericSlot) {
        return (
            <div
                className={`rounded-xl flex flex-col items-center justify-center text-xs gap-1 bg-surface-1/50 border border-border/60 text-muted-foreground select-none ${sizeClasses} ${className}`}
            >
                <span className="text-[10px] uppercase tracking-widest opacity-60">{label}</span>
                <span className="text-[10px] opacity-40">
                    {format === 'vertical' ? '300x600' : format === 'horizontal' ? 'Banner Mobile' : '300x250'}
                </span>
            </div>
        );
    }

    return (
        <div className={`overflow-hidden flex items-center justify-center ${sizeClasses} ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', height: '100%' }}
                data-ad-client={clientId}
                data-ad-slot={slot}
                data-ad-format={format === 'vertical' ? 'vertical' : 'auto'}
                data-full-width-responsive="true"
            />
        </div>
    );
}
