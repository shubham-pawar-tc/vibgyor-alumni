import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Firebase Hosting: `npm run build` writes plain HTML/JS/CSS to ./out
  output: "export",
  // Every route becomes folder/index.html, which Firebase Hosting serves directly
  trailingSlash: true,
  images: { unoptimized: true },
  // GitHub Pages serves the site under /<repo-name>/; the Pages workflow sets NEXT_PUBLIC_BASE_PATH.
  // Empty for Firebase and local dev.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  // With static export the build folder *is* the site. `npm run build` sets NEXT_DIST_DIR=build
  // (what firebase.json uploads); `npm run dev` keeps using .next so the two never clash.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
