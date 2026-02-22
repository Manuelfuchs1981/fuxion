import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Bilder von Supabase Storage erlauben
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
