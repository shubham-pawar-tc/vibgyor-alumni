"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BASE_PATH, FALLBACK_PARAM } from "./routeFallback";

/**
 * Reads a dynamic route segment. In the static builds, IDs created during the demo
 * (e.g. a newly joined alumnus) have no pre-built page, so they are served by the "_"
 * placeholder page instead:
 *  - Firebase rewrites the URL to it, so the real ID is still in the address bar.
 *  - GitHub Pages has no rewrites, so app/not-found.tsx redirects to "_/?id=<real id>".
 */
export function useRouteParam(name: string, segmentIndex: number): string {
  const params = useParams<Record<string, string>>();
  const fromRouter = params?.[name] ?? "";
  const [value, setValue] = useState(fromRouter);
  useEffect(() => {
    if (fromRouter !== FALLBACK_PARAM) {
      setValue(fromRouter);
      return;
    }
    const fromQuery = new URLSearchParams(window.location.search).get("id");
    if (fromQuery) {
      setValue(fromQuery);
      return;
    }
    const path = window.location.pathname.slice(BASE_PATH.length);
    const seg = path.split("/").filter(Boolean)[segmentIndex];
    if (seg && seg !== FALLBACK_PARAM) setValue(decodeURIComponent(seg));
  }, [fromRouter, segmentIndex]);
  return value;
}
