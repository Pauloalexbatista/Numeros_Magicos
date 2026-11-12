import { MetadataRoute } from 'next';
import { SYSTEM_CATALOG } from '@/services/systems-catalog';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://numerosmagicos.com';
    const now = new Date();
    const games = ['euromillions', 'totoloto', 'eurodreams', 'megasena', 'lotofacil'];
    const starGames = ['euromillions', 'totoloto', 'eurodreams'];

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
        { url: `${baseUrl}/games`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
        { url: `${baseUrl}/previsoes/proximo-sorteio`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
        { url: `${baseUrl}/ranking`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/wheeling`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/wheeling/stars`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/simulator`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
        { url: `${baseUrl}/tools`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
        { url: `${baseUrl}/tools/matriz-corte`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
        { url: `${baseUrl}/tools/radar`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
        { url: `${baseUrl}/tools/gerador-cirurgico`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
        { url: `${baseUrl}/tools/cruzador`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/tools/sismologia`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/tools/separacao-extremos`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/analysis/stars`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/probabilities`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/responsible-gaming`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ];

    const gameDashboardRoutes: MetadataRoute.Sitemap = games.map(game => ({
        url: `${baseUrl}/dashboard/${game}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.95,
    }));

    const gameRankingRoutes: MetadataRoute.Sitemap = games.map(game => ({
        url: `${baseUrl}/ranking/${game}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
    }));

    const starRankingRoutes: MetadataRoute.Sitemap = starGames.map(game => ({
        url: `${baseUrl}/analysis/stars/ranking/${game}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
    }));

    const systemCatalogRoutes: MetadataRoute.Sitemap = SYSTEM_CATALOG.map(sys => ({
        url: `${baseUrl}/systems/${sys.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.85,
    }));

    return [
        ...staticRoutes,
        ...gameDashboardRoutes,
        ...gameRankingRoutes,
        ...starRankingRoutes,
        ...systemCatalogRoutes,
    ];
}
