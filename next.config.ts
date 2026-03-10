import type { NextConfig } from "next";

// Backend API URL for proxying requests (avoids CORS issues in development)
const BACKEND_URL = process.env.EXTERNAL_API_URL || "http://localhost:8765";

const nextConfig: NextConfig = {
  // ── Performance ──
  // Enable React strict mode for catching bugs early
  reactStrictMode: true,

  // ── Images ──
  // Configure allowed external image domains (add your CDN/storage here)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com", // Clerk user avatars
      },
      // Add your image CDN here:
      // { protocol: "https", hostname: "your-cdn.com" },
    ],
  },

  // ── Headers ──
  async headers() {
    return [
      {
        // Security headers for all routes
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // ── Logging ──
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // ── API Proxy ──
  // Proxy /api/v1/* requests to the backend to avoid CORS issues
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
