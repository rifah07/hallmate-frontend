import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hallmate.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/api/', '/payments/', '/first-login', '/reset-password', '/account-status'] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
