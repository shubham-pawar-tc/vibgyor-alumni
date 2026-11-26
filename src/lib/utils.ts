export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function initials(name: string) {
  return name
    .replace(/^(Dr\.|Mrs\.|Mr\.|Ms\.)\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function firstName(name: string) {
  return name.replace(/^(Dr\.|Mrs\.|Mr\.|Ms\.)\s*/i, "").split(" ")[0];
}

/** Prefix for every message to a parent, so a parent with several children knows which one it is about. */
export function childTag(child: { name: string; className?: number }) {
  return `[${firstName(child.name)}${child.className ? ` · Class ${child.className}` : ""}]`;
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function timeAgo(iso: string, now = Date.now()) {
  const diff = (Date.parse(iso) - now) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), "day");
  return formatDate(iso);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function hoursSince(iso: string, now = Date.now()) {
  return (now - Date.parse(iso)) / 3600_000;
}

export function maskMobile(m: string) {
  const digits = m.replace(/\D/g, "");
  if (digits.length < 6) return m;
  return `+${digits.slice(0, 2)} ${digits.slice(2, 4)}XXX XX${digits.slice(-3)}`;
}

export function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

/** Deterministic avatar hue from a name */
export function avatarHue(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

/** Whole years since `dob` (ISO date). Undefined if no dob. */
export function ageFrom(dob?: string, at: Date = new Date()) {
  if (!dob) return undefined;
  const d = new Date(dob);
  let a = at.getFullYear() - d.getFullYear();
  if (at.getMonth() < d.getMonth() || (at.getMonth() === d.getMonth() && at.getDate() < d.getDate())) a--;
  return a;
}
