import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; img-src 'self' data: https:; font-src 'self'; frame-ancestors 'none';" }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'i.ibb.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.brandfetch.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'assets-global.website-files.com', port: '', pathname: '/**' },
    ],
  },
};

export default nextConfig;
