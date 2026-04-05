import type { NextConfig } from "next";

// Backend API URL for proxying requests (avoids CORS issues in development)
const BACKEND_URL = process.env.EXTERNAL_API_URL || "http://localhost:8765";

// S3/DO Spaces origin for presigned uploads (e.g. "https://nyc3.digitaloceanspaces.com")
// Needed in connect-src so the browser can PUT files directly to the presigned URL.
const S3_UPLOAD_ORIGIN =
  process.env.NEXT_PUBLIC_S3_UPLOAD_ORIGIN || "https://*.digitaloceanspaces.com";

// Environment-aware CSP - relaxed for local development
const isDev = process.env.NODE_ENV === "development";
const CSP_DIRECTIVES = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.joinrosterly.com https://challenges.cloudflare.com${isDev ? " http://localhost:*" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${S3_UPLOAD_ORIGIN} https://*.clerk.com https://*.clerk.accounts.dev https://clerk.joinrosterly.com${isDev ? " http://localhost:* ws://localhost:*" : ""}`,
  "frame-src https://*.clerk.accounts.dev https://clerk.joinrosterly.com https://challenges.cloudflare.com",
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
