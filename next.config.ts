import type { NextConfig } from "next";

// Backend API URL for proxying requests (avoids CORS issues in development)
const BACKEND_URL = process.env.EXTERNAL_API_URL || "http://localhost:8765";

// Environment-aware CSP - relaxed for local development
const isDev = process.env.NODE_ENV === "development";
const CSP_DIRECTIVES = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://challenges.cloudflare.com${isDev ? " http://localhost:*" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev${isDev ? " http://localhost:* ws://localhost:*" : ""}`,
  "frame-src https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
].join("; ");

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
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: CSP_DIRECTIVES,
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
