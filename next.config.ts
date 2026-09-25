import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves the qualities listed here. 75 is the default; 90 is for product photos.
    qualities: [75, 90],
    // Product photos are set in the CMS as URLs, so any https host is allowed. Once the backend serves them from
    // one place (a bucket, a CDN), list only that host here.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
