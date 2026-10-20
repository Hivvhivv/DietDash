import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: true,
  // Modul native/driver dijalankan langsung oleh Node, tidak dibundel.
  serverExternalPackages: ['@node-rs/argon2', 'mongodb'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Diabaikan peramban bila dikirim lewat HTTP biasa (mis. localhost).
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
