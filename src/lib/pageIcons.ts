import {
  BadgeCheck,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  Copy,
  Database,
  FileClock,
  FileLock2,
  Flag,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  NotebookPen,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

const R = "var(--r)", O = "var(--o)", Y = "var(--y)", G = "var(--g)", B = "var(--b)", I = "var(--i)", V = "var(--v)";

/** Icon + brand colour for each portal route, shown in the page header. Longest prefix wins. */
const map: [string, LucideIcon, string][] = [
  ["/portal/admin/verification", BadgeCheck, G],
  ["/portal/admin/safeguarding", ShieldAlert, R],
  ["/portal/admin/moderation", Flag, O],
  ["/portal/admin/requests", FileLock2, V],
  ["/portal/admin/content", CalendarCheck, B],
  ["/portal/admin/records", Database, I],
  ["/portal/admin/engagement", NotebookPen, Y],
  ["/portal/admin/consents", ClipboardCheck, G],
  ["/portal/admin/duplicates", Copy, O],
  ["/portal/admin/masters", ListChecks, B],
  ["/portal/admin/broadcast", Megaphone, R],
  ["/portal/admin/audit", FileClock, I],
  ["/portal/admin/permissions", KeyRound, Y],
  ["/portal/admin/settings", Settings, V],
  ["/portal/profile", UserRound, B],
  ["/portal/directory", Users, R],
  ["/portal/groups", UsersRound, G],
  ["/portal/chats", MessageCircle, B],
  ["/portal/messages", MessagesSquare, V],
  ["/portal/child-chats", MessagesSquare, V],
  ["/portal/jobs", Briefcase, O],
  ["/portal/events", CalendarDays, Y],
  ["/portal/invite", Send, G],
  ["/portal/vouch", HeartHandshake, R],
  ["/portal/mentors", Search, G],
  ["/portal/mentor", GraduationCap, V],
  ["/portal/consent", ShieldCheck, G],
  ["/portal/people", UserRound, B],
  ["/portal", LayoutDashboard, I],
];

export function pageIconFor(pathname: string | null): { icon: LucideIcon; color: string } | null {
  if (!pathname) return null;
  const hit = map.find(([p]) => pathname === p || pathname.startsWith(p + "/"));
  return hit ? { icon: hit[1], color: "var(--primary)" } : null;
}
