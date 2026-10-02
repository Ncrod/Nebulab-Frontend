import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves the qualities listed here. 75 is the default; 90 is for product photos.
    qualities: [75, 90],
    // Product photos are set in the CMS as URLs, so any https host is allowed. Once the backend serves them from
    // one place (a bucket, a CDN), list only that host here.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking: this site is never meant to be framed by another origin.
          { key: "X-Frame-Options", value: "DENY" },
          // Stops the browser from guessing a response's content type away from what the server declared.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Sends the full URL only to this site's own origin; other sites only get the origin, not the full path.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
