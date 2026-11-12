import { auth } from "@/auth"
import { NextResponse } from "next/server"

const BOT_USER_AGENTS = /googlebot|mediapartners-google|adsbot-google|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebot|facebookexternalhit|twitterbot|whatsapp|telegrambot|linkedinbot|applebot/i;

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const path = req.nextUrl.pathname
    const userAgent = req.headers.get('user-agent') || ''
    const isSearchBot = BOT_USER_AGENTS.test(userAgent)

    // 1. Porta de Entrada Obrigatória (/login) para visitantes humanos que ainda não aceitaram os termos.
    // Os robôs de indexação (Googlebot / AdSense) passam diretamente para indexar todas as páginas.
    const hasAcceptedTerms = req.cookies.has('terms_accepted');
    const requireTermsRoutes = [
        "/games", "/systems", "/dashboard", "/ranking", "/analysis", "/statistics",
        "/history", "/simulator", "/wheeling", "/tools", "/previsoes", "/how-it-works",
        "/matrix", "/mean", "/patterns", "/sequences", "/probabilities"
    ];

    const needsTerms = requireTermsRoutes.some(route => path.startsWith(route));
    if (needsTerms && !hasAcceptedTerms && !isSearchBot) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // 2. Security Headers (including Google Analytics & Google AdSense CSP support)
    const response = NextResponse.next()

    // Prevent clickjacking on main site while allowing AdSense iframes
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // XSS Protection
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // Content Security Policy allowing Google Analytics + Google AdSense
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://pagead2.googlesyndication.com https://adservice.google.com https://www.googletagservices.com https://tpc.googlesyndication.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https: https://www.google-analytics.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://flagcdn.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
            "connect-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://pagead2.googlesyndication.com https://adservice.google.com https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google"
        ].join('; ')
    )

    return response
})

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|ads.txt|robots.txt|sitemap.xml).*)',
    ],
}
