import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://utsaphire.dev';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/test', '/api/'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/test'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/test'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/test'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/test'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/test'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
