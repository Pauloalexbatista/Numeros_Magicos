import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const path = req.nextUrl.pathname

    // Whitelist: Public routes that don't require login
    const publicRoutes = [
        "/login",
        "/admin",              // Hidden Lab Routes
        "/games",              // Game selection page (after disclaimer)
        "/dashboard",          // Game analysis pages (euromillions, totoloto, eurodreams)
        "/ranking",            // Rankings and system details
        "/analysis",           // Star analysis pages
        "/register",
        "/contact",
        "/about",              // About Us page
        "/responsible-gaming", // Responsible Gaming page
        "/legal",              // Terms and Privacy pages
        "/tools",              // Tools and utilities
        "/wheeling",           // Number/Star wheeling tools
        "/simulator",          // Betting/ROI simulators
        "/probabilities",      // Probability tables
        "/how-it-works",       // Documentation page
        "/api/auth",           // Essential for NextAuth
        "/api/admin",          // Hidden Lab API calls (secured by secret parameter)
        "/_next",              // Next.js static files
        "/favicon.ico",
        "/images"              // Public images
    ]

    const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

    // 1. Redirect unauthenticated users to Login
    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", req.nextUrl))
    }

    // 2. Redirect logged-in users away from Auth pages
    if (isLoggedIn && (path === "/login" || path === "/register")) {
        return NextResponse.redirect(new URL("/", req.nextUrl))
    }

    // 3. Protect /admin/* routes - require ADMIN role
    // Admin protection removed

    // 4. Add Security Headers
    const response = NextResponse.next()

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY')

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // XSS Protection (legacy but still useful)
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // Content Security Policy (basic - adjust as needed)
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    )

    return response
})

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
