import type { NextConfig } from 'next';

const dev = process.env.NODE_ENV !== 'production';

// Static CSP (no nonce, so pages stay cacheable). Nothing loads from or
// talks to another origin except images from our Cloudinary and, until the
// seed has copied them, the old hall site.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://hall.jnu.ac.bd",
  "font-src 'self'",
  `connect-src 'self'${dev ? ' ws:' : ''}`,
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://sandbox.sslcommerz.com https://securepay.sslcommerz.com",
  "frame-ancestors 'none'",
  ...(dev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
