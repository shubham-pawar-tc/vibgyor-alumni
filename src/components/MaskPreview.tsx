"use client";

import { ShieldAlert } from "lucide-react";
import { maskContacts, maskKindLabel } from "@/lib/mask";

/** Live warning shown while typing when contact details would be masked (CS-6). */
export function MaskPreview({ text }: { text: string }) {
  const { kinds } = maskContacts(text);
  if (!kinds.length) return null;
  return (
    <div className="animate-in flex items-start gap-2.5 rounded-xl bg-warning-soft px-3.5 py-2.5 text-[13.5px] text-warning">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        <b>Contact details will be hidden:</b> {kinds.map((k) => maskKindLabel[k]).join(", ")}. Please keep conversations on the platform; your campus will be notified.
      </span>
    </div>
  );
}

/** Render masked placeholders as subtle chips. */
export function MaskedText({ text }: { text: string }) {
  const parts = text.split(/(\[(?:phone|email|link|handle|off-platform app) hidden\])/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\[.* hidden\]$/.test(p) ? (
          <span key={i} className="mx-0.5 inline-flex items-center rounded-md bg-warning-soft px-1.5 py-px text-[0.85em] font-semibold text-warning">
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}
