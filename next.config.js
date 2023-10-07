/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/{{member}}',
      skipDefaultConversion: true,
      preventFullImport: true,
    },
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node/,
      use: 'raw-loader',
    });

    return config;
  },
}
module.exports = nextConfig
