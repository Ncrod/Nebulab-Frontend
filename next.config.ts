import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves the qualities listed here. 75 is the default; 90 is for product photos.
    qualities: [75, 90],
  },
};

export default nextConfig;
