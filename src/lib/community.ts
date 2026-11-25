import { campusName, defaultPrivacy } from "./data";
import type { PrivateField, State, User } from "./types";

/** Can `viewer` see `field` on `owner`'s profile? (A10 per-field privacy) */
export function canSee(viewer: User | undefined, owner: User, field: PrivateField): boolean {
  if (!viewer) return false;
  if (viewer.id === owner.id) return true;
  // campus staff see everything for the alumni they manage (needed for data quality, A6)
  if (["CAD", "GAO", "SAD"].includes(viewer.role)) return viewer.campusIds.includes(owner.campusIds[0]);
  if (viewer.role !== "ALU") return false;
  const v = (owner.profile?.privacy ?? defaultPrivacy)[field];
  if (v === "alumni") return true;
  if (v === "batch") return viewer.batch === owner.batch && viewer.campusIds[0] === owner.campusIds[0];
  return false;
}

export interface Group {
  id: string;
  name: string;
  kind: "campus" | "batch";
  campusId: string;
  batch?: number;
}

export function groupsFor(u: User): Group[] {
  const c = u.campusIds[0];
  const out: Group[] = [{ id: `campus:${c}`, name: `${campusName(c)} alumni`, kind: "campus", campusId: c }];
  if (u.batch) out.unshift({ id: `batch:${c}:${u.batch}`, name: `Batch of ${u.batch} · ${campusName(c)}`, kind: "batch", campusId: c, batch: u.batch });
  return out;
}

export function groupMembers(s: State, g: Group) {
  return s.users.filter((u) => u.role === "ALU" && !u.deactivated && u.campusIds[0] === g.campusId && (g.kind === "campus" || u.batch === g.batch));
}

/** Profile completeness out of 100 (B16: drives the nudge on the alumni home) */
export function completeness(u: User) {
  const p = u.profile;
  const checks = [
    !!p?.headline,
    !!u.city,
    !!(p?.work.length),
    !!(p?.education.length),
    !!(p?.skills.length),
    !!(p?.achievements.length),
    !!p?.linkedin,
    !!p?.resumeName,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/** Build a downloadable .ics calendar file (G2 add-to-calendar) */
export function icsFor(e: { id: string; title: string; start: string; end: string; venue: string; description: string }) {
  const f = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VIBGYOR Alumni//Prototype//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@vaa.vibgyor.in`,
    `DTSTAMP:${f(new Date().toISOString())}`,
    `DTSTART:${f(e.start)}`,
    `DTEND:${f(e.end)}`,
    `SUMMARY:${e.title}`,
    `LOCATION:${e.venue}`,
    `DESCRIPTION:${e.description.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalUrl(e: { title: string; start: string; end: string; venue: string; description: string }) {
  const f = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const q = new URLSearchParams({ action: "TEMPLATE", text: e.title, dates: `${f(e.start)}/${f(e.end)}`, location: e.venue, details: e.description });
  return `https://calendar.google.com/calendar/render?${q}`;
}
