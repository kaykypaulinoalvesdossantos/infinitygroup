/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

// A configuração de request existente está em src/i18n.ts.
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/contato',
        destination: '/orcamento',
        permanent: true,
      },
      {
        source: '/servicos/desenvolvimento-software',
        destination: '/servicos/aplicativos-computador',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizeCss: true,
  },
}

module.exports = withNextIntl(nextConfig)
