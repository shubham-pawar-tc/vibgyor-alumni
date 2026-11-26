/** Placeholder segment pre-built for IDs that only exist at runtime (static export). See firebase.json rewrites. */
export const FALLBACK_PARAM = "_";

/** Base path the site is served under ("" on Firebase / local, "/vibgyor-alumni" on GitHub Pages). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Prefix an in-app path with the base path, for the few places that bypass next/link and the router. */
export const withBase = (path: string) => `${BASE_PATH}${path}`;
