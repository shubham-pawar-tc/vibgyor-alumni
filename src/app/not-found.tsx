"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { BASE_PATH, FALLBACK_PARAM } from "@/lib/routeFallback";

/** Routes whose IDs may be created at runtime; unknown IDs are forwarded to the pre-built "_" page. */
const dynamicRoutes = [/^\/portal\/people\/([^/]+)\/?$/, /^\/consent\/([^/]+)\/?$/];

export default function NotFound() {
  const [forwarding, setForwarding] = useState(true);

  useEffect(() => {
    const path = window.location.pathname.slice(BASE_PATH.length);
    for (const re of dynamicRoutes) {
      const m = path.match(re);
      if (m && m[1] !== FALLBACK_PARAM) {
        const base = path.replace(/[^/]+\/?$/, "");
        window.location.replace(`${BASE_PATH}${base}${FALLBACK_PARAM}/?id=${encodeURIComponent(decodeURIComponent(m[1]))}`);
        return;
      }
    }
    setForwarding(false);
  }, []);

  if (forwarding) return null;
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-border bg-surface-2 text-muted">
          <Compass className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-body text-muted">That page doesn&apos;t exist in this prototype.</p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-fg">
          Back to home
        </Link>
      </div>
    </main>
  );
}
