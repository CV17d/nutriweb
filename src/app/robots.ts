import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/gestion-andres/', '/api/', '/checkout/'],
    },
    sitemap: 'https://andresburbanonutricionista.com/sitemap.xml',
  };
}
