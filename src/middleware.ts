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

    // 2. Security Headers (including full Google Analytics & Google AdSense CSP support)
    const response = NextResponse.next()

    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // Content Security Policy allowing Google Analytics + Google AdSense (scripts, iframes, images & connections)
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://*.googlesyndication.com https://*.google.com https://*.googletagservices.com https://*.doubleclick.net https://*.adtrafficquality.google",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googlesyndication.com",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data: https://fonts.gstatic.com https:",
            "frame-src 'self' https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.adtrafficquality.google https://*.googletagservices.com",
            "connect-src 'self' https://*.google-analytics.com https://*.doubleclick.net https://*.googletagmanager.com https://*.googlesyndication.com https://*.google.com https://*.adtrafficquality.google"
        ].join('; ')
    )

    return response
})

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|ads.txt|robots.txt|sitemap.xml).*)',
    ],
}
