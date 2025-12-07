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
};

module.exports = nextConfig;
