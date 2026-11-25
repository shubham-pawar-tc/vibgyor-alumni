import { masterUserKey } from "./data";
import { canSee } from "./community";
import type { MasterItem, MasterKind, State, User } from "./types";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

function lev(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

export interface DuplicatePair {
  a: User;
  b: User;
  score: number;
  reasons: string[];
}

/** L4: likely duplicates among alumni records */
export function findDuplicates(users: User[]): DuplicatePair[] {
  const pool = users.filter((u) => (u.role === "ALU" || u.role === "ALP") && !u.deactivated);
  const out: DuplicatePair[] = [];
  for (let i = 0; i < pool.length; i++)
    for (let j = i + 1; j < pool.length; j++) {
      const a = pool[i];
      const b = pool[j];
      const reasons: string[] = [];
      let score = 0;
      if (a.email.toLowerCase() === b.email.toLowerCase()) { score += 100; reasons.push("Same email"); }
      if (a.mobile !== "—" && a.mobile.replace(/\D/g, "") === b.mobile.replace(/\D/g, "")) { score += 50; reasons.push("Same mobile"); }
      const na = norm(a.name);
      const nb = norm(b.name);
      const ta = na.split(" ");
      const tb = nb.split(" ");
      if (na === nb) { score += 40; reasons.push("Same name"); }
      else if (lev(na, nb) <= 2) { score += 30; reasons.push("Name differs by 1–2 letters"); }
      else if (ta[0] === tb[0] && ta.at(-1) === tb.at(-1)) { score += 30; reasons.push("Same first and last name"); }
      if (a.campusIds[0] === b.campusIds[0] && a.batch === b.batch) { score += 25; reasons.push("Same campus and batch"); }
      if (a.company && a.company === b.company) { score += 10; reasons.push("Same company"); }
      if (score >= 60) out.push({ a, b, score: Math.min(100, score), reasons });
    }
  return out.sort((x, y) => y.score - x.score);
}

export interface Unmapped {
  kind: MasterKind;
  value: string;
  count: number;
  suggestion?: MasterItem;
  why?: "alias" | "similar";
}

/** L5 / DM-3: values in records that aren't the standard name on a master list */
export function unmappedValues(s: State): Unmapped[] {
  if (!s.masters) return [];
  const out: Unmapped[] = [];
  (Object.keys(masterUserKey) as MasterKind[]).forEach((kind) => {
    const items = s.masters[kind];
    const names = new Set(items.map((m) => m.name));
    const counts = new Map<string, number>();
    s.users.forEach((u) => {
      const v = u[masterUserKey[kind]] as string | undefined;
      if (v && !names.has(v)) counts.set(v, (counts.get(v) ?? 0) + 1);
    });
    counts.forEach((count, value) => {
      const nv = norm(value);
      let suggestion = items.find((m) => m.aliases.some((a) => norm(a) === nv));
      let why: Unmapped["why"] = suggestion ? "alias" : undefined;
      if (!suggestion) {
        // score each list item: shared word starts (name or aliases) count most, then spelling distance
        const tokens = nv.split(" ").filter((t) => t.length > 2);
        let best = -Infinity;
        for (const m of items) {
          const hay = norm([m.name, ...m.aliases].join(" "));
          const matches = tokens.filter((t) => hay.includes(t.slice(0, Math.min(5, t.length)))).length;
          const sc = matches * 6 - lev(nv, norm(m.name)) / 2;
          if (matches > 0 && sc > best) {
            best = sc;
            suggestion = m;
          }
        }
        why = suggestion ? "similar" : undefined;
      }
      out.push({ kind, value, count, suggestion, why });
    });
  });
  return out;
}

/** L3 + CS-14: CSV export that still honours each member's "Only me" choices */
export const exportFields = [
  { key: "name", label: "Name" },
  { key: "batch", label: "Batch" },
  { key: "campus", label: "Campus" },
  { key: "email", label: "Email", privacy: "email" },
  { key: "mobile", label: "Mobile", privacy: "mobile" },
  { key: "company", label: "Company", privacy: "company" },
  { key: "title", label: "Job title" },
  { key: "city", label: "City", privacy: "city" },
  { key: "college", label: "College", privacy: "education" },
] as const;

export function toCsv(rows: (string | number | undefined)[][]) {
  return rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
}

/** For exports we treat "Only me" as hidden even from staff, so the file never leaks it */
export function exportValue(u: User, field: (typeof exportFields)[number], campusName: (id: string) => string) {
  if ("privacy" in field && u.profile?.privacy[field.privacy] === "private") return "(hidden by member)";
  if (field.key === "campus") return campusName(u.campusIds[0]);
  return (u as unknown as Record<string, string | number | undefined>)[field.key];
}

export function download(name: string, content: string, type = "text/csv") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export { canSee };

/** A11 / CS-11: everything the platform holds about one person, as JSON */
export function buildDataExport(s: State, userId: string) {
  const u = s.users.find((x) => x.id === userId);
  if (!u) return "{}";
  const data = {
    generatedAt: new Date().toISOString(),
    note: "Prototype export. In production this file is prepared by the platform and sent over a secure link.",
    account: { ...u, profile: undefined },
    profile: u.profile,
    consents: s.consents.filter((c) => c.studentId === userId || c.givenBy === userId),
    studentMentorMessages: s.messages.filter((m) => m.senderId === userId).map((m) => ({ at: m.at, text: m.text })),
    alumniChats: s.dms.filter((m) => m.senderId === userId).map((m) => ({ at: m.at, text: m.text })),
    groupPosts: s.posts.filter((p) => p.authorId === userId).map((p) => ({ at: p.at, text: p.text })),
    jobsPosted: s.jobs.filter((j) => j.postedBy === userId).map((j) => ({ title: j.title, status: j.status })),
    eventRsvps: s.events.flatMap((e) => e.rsvps.filter((r) => r.userId === userId).map((r) => ({ event: e.title, status: r.status }))),
    engagementLog: s.engagements.filter((e) => e.alumniId === userId),
    dataRequests: s.dataRequests.filter((r) => r.subjectId === userId),
  };
  return JSON.stringify(data, null, 2);
}
