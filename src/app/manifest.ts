import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Números Mágicos AI',
        short_name: 'Números Mágicos',
        description: 'Previsões de EuroMilhões com Inteligência Artificial',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#4f46e5',
        icons: [
            {
                src: '/crystal-ball.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/crystal-ball.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
