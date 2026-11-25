import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `npm run dev` uses .next; production builds can use their own folder so the two never clash
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
