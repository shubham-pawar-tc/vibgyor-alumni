"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FALLBACK_PARAM } from "./routeFallback";

/**
 * Reads a dynamic route segment. In the static Firebase build, IDs created during the demo
 * (e.g. a newly joined alumnus) are served by the "_" placeholder page via a hosting rewrite,
 * so we read the real ID from the address bar instead.
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
    const seg = window.location.pathname.split("/").filter(Boolean)[segmentIndex];
    if (seg) setValue(decodeURIComponent(seg));
  }, [fromRouter, segmentIndex]);
  return value;
}
