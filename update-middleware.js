const fs = require('fs');
let content = fs.readFileSync('src/middleware.ts', 'utf8');

if (!content.includes('terms_accepted')) {
    const checkTerms = `
    const hasAcceptedTerms = req.cookies.has('terms_accepted');
    const requireTermsRoutes = [
        "/games", "/dashboard", "/ranking", "/analysis", "/statistics", "/history", "/simulator", "/wheeling"
    ];
    
    const needsTerms = requireTermsRoutes.some(route => path.startsWith(route));
    if (needsTerms && !hasAcceptedTerms) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    `;
    
    // Insert after path = req.nextUrl.pathname
    content = content.replace(/const path = req\.nextUrl\.pathname/, "const path = req.nextUrl.pathname\n" + checkTerms);
    fs.writeFileSync('src/middleware.ts', content, 'utf8');
    console.log('Middleware updated to require terms_accepted cookie.');
} else {
    console.log('Middleware already checks terms_accepted');
}
