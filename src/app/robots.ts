import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin',
                '/admin/*',
                '/api/*',
                '/admin',
                '/admin/*',
                '/api/*',
            ],
        },
        sitemap: 'https://numerosmagicos.com/sitemap.xml',
    };
}
