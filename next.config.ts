import type { NextConfig } from "next";
import { imageHosts } from "./app/lib/image-policy";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves the qualities listed here. 75 is the default; 90 is for product photos.
    qualities: [75, 90],
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "https" as const, hostname, port: "", pathname: "/**" })),
    maximumRedirects: 0,
    localPatterns: [{ pathname: "/images/**", search: "" }, { pathname: "/svg/**", search: "" }],
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
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
        ],
      },
    ];
  },
};

export default nextConfig;
