const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  images: {
    // Enabled image optimization for better performance
    // unoptimized: true, 
  },
  experimental: {
    // Remove if not using Server Components
    serverComponentsExternalPackages: ['mongodb', 'firebase-admin'],
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons', 'date-fns', 'lodash'],
  },
  // API route body size limit (10MB for image uploads)
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Security: Use specific origins instead of wildcard in production
          { key: "Access-Control-Allow-Origin", value: process.env.CORS_ORIGINS || (process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*') },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
