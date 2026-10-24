import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Hind_Siliguri, Noto_Serif_Bengali } from 'next/font/google';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { SessionProvider } from '@/lib/session';
import { site } from '@/lib/site';
import './globals.css';

// Self-hosted by next/font: no request to Google from the reader's browser.
// Hind Siliguri carries both Bangla and English, so mixed text matches.
const serif = Cormorant_Garamond({ variable: '--font-serif', subsets: ['latin'], weight: ['500', '600'] });
const sans = Hind_Siliguri({ variable: '--font-sans', subsets: ['latin', 'bengali'], weight: ['400', '500', '600'] });
const bnSerif = Noto_Serif_Bengali({ variable: '--font-bn-serif', subsets: ['bengali'], weight: ['500', '600'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: site.name, template: `%s · ${site.short}` },
  description: site.description,
  openGraph: { siteName: site.name, type: 'website' },
};

export const viewport: Viewport = { themeColor: '#4b2a52' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${bnSerif.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SessionProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
