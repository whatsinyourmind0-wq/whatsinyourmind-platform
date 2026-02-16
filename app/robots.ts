import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',      // Protect API
                    '/auth/',     // Protect Auth flows
                    '/account/',  // Protect User Accounts
                    '/feedback/', // Protect Feedback
                    '/blocked/',  // No need to index the kill switch page
                ],
            },
            {
                userAgent: 'GPTBot', // OpenAI
                disallow: '/',
            },
            {
                userAgent: 'CCBot', // Common Crawl
                disallow: '/',
            },
            {
                userAgent: 'Google-Extended', // Google Gemini/Bard training data
                disallow: '/',
            },
            {
                userAgent: 'FacebookBot', // Meta
                disallow: '/',
            },
            {
                userAgent: 'anthropic-ai', // Claude
                disallow: '/',
            },
            {
                userAgent: 'Bytespider', // TikTok/ByteDance
                disallow: '/',
            },
        ],
        sitemap: 'https://whatsinyourmind.com/sitemap.xml',
    }
}
