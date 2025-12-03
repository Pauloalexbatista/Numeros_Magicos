import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const path = req.nextUrl.pathname

    // Whitelist: Public routes that don't require login
    const publicRoutes = [
        "/login",
        "/register",
        "/contact",
        "/api/auth", // Essential for NextAuth
        "/_next",    // Next.js static files
        "/favicon.ico",
        "/images"    // Public images
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

    return NextResponse.next()
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
