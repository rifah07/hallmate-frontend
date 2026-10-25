import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hallmate.vercel.app';
// Public pages only; dashboards and sign-in flows stay out of search.
const PAGES = ['', 'about', 'notices', 'events', 'achievements', 'admission', 'apply', 'dining', 'facilities', 'gallery', 'provost', 'provosts', 'house-tutors', 'staff', 'faq', 'contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({ url: `${SITE}/${p}`, changeFrequency: p === 'notices' || p === 'events' ? 'daily' : 'monthly' }));
}
