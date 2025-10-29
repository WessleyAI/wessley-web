/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard build for Netlify deployment
  // output: 'export', // Disabled due to 404 page errors
  experimental: {
    // Skip prerendering error pages
    optimizeCss: false,
  },
  // Disable linting during build for Netlify deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable strict mode for compatibility
  reactStrictMode: false,
  // Images configuration
  images: {
    // Disable optimization for static export
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;