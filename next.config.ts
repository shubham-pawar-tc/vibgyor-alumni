import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Firebase Hosting: `npm run build` writes plain HTML/JS/CSS to ./out
  output: "export",
  // Every route becomes folder/index.html, which Firebase Hosting serves directly
  trailingSlash: true,
  images: { unoptimized: true },
  // With static export the build folder *is* the site. `npm run build` sets NEXT_DIST_DIR=build
  // (what firebase.json uploads); `npm run dev` keeps using .next so the two never clash.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
