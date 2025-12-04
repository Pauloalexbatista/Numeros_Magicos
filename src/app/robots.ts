import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/profile/', '/api/', '/admin/'],
        },
        sitemap: 'https://numeros-magicos.vercel.app/sitemap.xml',
    };
}
