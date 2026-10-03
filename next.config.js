/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node$/,
      use: 'raw-loader',
    });
    return config;
  },
  async redirects() {
    return [
      {
        source: '/congregacao/publicadores',
        destination: '/congregacao/pessoas',
        permanent: true,
      },
      {
        source: '/congregacao/publicadores/:path*',
        destination: '/congregacao/pessoas/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
