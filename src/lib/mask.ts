import type { MaskKind } from "./types";

/**
 * CS-6: phone numbers, email addresses, social handles and external links are
 * automatically blocked or masked in student–alumni messages.
 */
const rules: { kind: MaskKind; re: RegExp; label: string }[] = [
  { kind: "email", re: /[A-Z0-9._%+-]+\s?(?:@|\(at\)|\[at\])\s?[A-Z0-9.-]+\s?(?:\.|\(dot\))\s?[A-Z]{2,}/gi, label: "[email hidden]" },
  { kind: "link", re: /\b(?:https?:\/\/|www\.)[^\s]+/gi, label: "[link hidden]" },
  {
    kind: "link",
    re: /\b[a-z0-9-]+\.(?:com|in|net|org|io|me|co|ly|gg|app|link)(?:\/[^\s]*)?\b/gi,
    label: "[link hidden]",
  },
  { kind: "phone", re: /(?:\+?\d[\d\s\-().]{6,}\d)/g, label: "[phone hidden]" },
  { kind: "handle", re: /(^|\s)@[a-z0-9_.]{2,}/gi, label: "$1[handle hidden]" },
  {
    kind: "app",
    re: /\b(?:whats\s?app|insta(?:gram)?|snap(?:chat)?|telegram|signal|discord|dm me)\b/gi,
    label: "[off-platform app hidden]",
  },
];

export function maskContacts(input: string): { text: string; kinds: MaskKind[] } {
  let text = input;
  const kinds = new Set<MaskKind>();
  for (const r of rules) {
    r.re.lastIndex = 0;
    if (r.kind === "phone") {
      // Only treat as a phone number when it has 8+ digits (avoids "2004-2016", "Class 12").
      text = text.replace(r.re, (m) => {
        if (m.replace(/\D/g, "").length >= 8) {
          kinds.add("phone");
          return r.label;
        }
        return m;
      });
      continue;
    }
    if (r.re.test(text)) {
      kinds.add(r.kind);
      r.re.lastIndex = 0;
      text = text.replace(r.re, r.label);
    }
  }
  return { text, kinds: [...kinds] };
}

export const maskKindLabel: Record<MaskKind, string> = {
  phone: "phone number",
  email: "email address",
  link: "external link",
  handle: "social handle",
  app: "off-platform app",
};
