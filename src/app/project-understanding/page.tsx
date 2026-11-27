"use client";

/* Project understanding: a one-page guide to how the prototype works, for demos.
   Every rule here is taken from the code (src/lib/store.tsx, data.ts, mask.ts, AppShell.tsx).
   If a rule changes in code, update it here too. */

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Lock, Minus } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/Public";
import { Emoji, type EmojiName } from "@/components/Emoji";
import { FunkTitle, PillEyebrow, STICKER, Underlined } from "@/components/Funk";
import { Reveal } from "@/components/motion";

/* ================================================================== data */

type RoleCode = "VIS" | "STU" | "PAR" | "ALP" | "ALU" | "TCH" | "CAD" | "GAO" | "FIN" | "MCZ" | "SAD";

type RoleInfo = {
  code: RoleCode;
  name: string;
  emoji: EmojiName;
  group: "Public" | "Community" | "Staff";
  login: string;
  scope: string;
  persona?: string;
  can: string[];
  cannot: string[];
  needs: string;
  menu: string[];
};

const roles: RoleInfo[] = [
  {
    code: "VIS",
    name: "Visitor",
    emoji: "wave",
    group: "Public",
    login: "Not signed in",
    scope: "Public pages only",
    can: ["Read the landing page", "Join or claim an alumni profile", "Send an enquiry", "Take the guided demo"],
    cannot: ["See any person's data", "Open the portal"],
    needs: "Nothing. Becomes Alumni (Pending or Verified) after Join.",
    menu: ["Home", "Join", "Login", "Contact", "Guided demo"],
  },
  {
    code: "STU",
    name: "Student",
    emoji: "backpack",
    group: "Community",
    login: "OTP · account made from school records",
    scope: "Own account, own campus",
    persona: "Aarav Mehta (locked) · Diya Iyer (active)",
    can: ["Find a mentor and message them", "Show interest in internships", "Request a MyCareerZ session", "See campus events"],
    cannot: ["Use anything before a parent consents", "See alumni without a Mentor badge", "Contact an employer directly"],
    needs: "A parent's OTP consent. Mentor contact consent to message mentors. MyCareerZ consent for sessions.",
    menu: ["Home", "Find a mentor", "Messages", "Internships", "MyCareerZ", "Events", "My profile"],
  },
  {
    code: "PAR",
    name: "Parent / Guardian",
    emoji: "family",
    group: "Community",
    login: "OTP on school-registered mobile / email",
    scope: "Own children only",
    persona: "Neha Mehta (mother of Aarav & Riya) · Rohit Mehta (father)",
    can: ["Give or withdraw each consent", "Read and join the child's mentor chats", "Book and pay for MyCareerZ", "See events for every child's campus"],
    cannot: ["Start a new mentor chat", "Donate", "See other children"],
    needs: "Being the guardian on the school record.",
    menu: ["Home", "Consent centre", "Mentor chats", "MyCareerZ", "Events"],
  },
  {
    code: "ALP",
    name: "Alumni – Pending",
    emoji: "hourglass",
    group: "Community",
    login: "OTP / password",
    scope: "Own profile only",
    persona: "Sneha Kulkarni",
    can: ["Edit own profile", "Request school documents", "Donate", "Answer the campus's info request"],
    cannot: ["Open the directory (locked)", "Join groups, jobs or chats"],
    needs: "Campus Admin approval, or 2 verified batchmates vouching.",
    menu: ["Home", "My profile", "Alumni directory 🔒", "School documents", "Give"],
  },
  {
    code: "ALU",
    name: "Alumni – Verified",
    emoji: "graduation-cap",
    group: "Community",
    login: "OTP / password",
    scope: "Alumni community",
    persona: "Priya Sharma (Mentor) · Rohan Gupta (not a mentor yet)",
    can: ["Directory, batch groups and chats", "Jobs, events, invites", "Vouch for batchmates", "Apply for badges (Mentor, Recruiter, Service Provider)"],
    cannot: ["Message students without an active Mentor badge", "Post jobs without a Recruiter badge"],
    needs: "Verification (auto match, Campus Admin or peer vouch).",
    menu: ["Home", "Profile", "Directory", "Batch groups", "Chats", "Jobs", "Events", "Business directory", "Invite", "Vouch", "Mentor", "Badges", "Documents", "Give"],
  },
  {
    code: "TCH",
    name: "Teacher / Counsellor",
    emoji: "teacher",
    group: "Staff",
    login: "OTP + 2-factor",
    scope: "Own campus",
    persona: "Mrs. Sheryl Fernandes · Malad",
    can: ["Receive student internship interest", "Check with parent, pass on or decline", "Refer students to MyCareerZ", "Log alumni interactions"],
    cannot: ["Broadcast", "Export data", "Act outside own campus"],
    needs: "Created by a Campus Admin (or GAO / Super Admin).",
    menu: ["Home", "Student interest", "Engagement log"],
  },
  {
    code: "CAD",
    name: "Campus Admin",
    emoji: "school",
    group: "Staff",
    login: "OTP + 2-factor",
    scope: "Own campus",
    persona: "Meera Joshi · Malad (pilot)",
    can: ["Verify alumni, approve badges", "Watch safeguarding alerts, suspend mentors", "Moderate, handle data requests, approve jobs", "Broadcast, manage records and teachers"],
    cannot: ["See other campuses", "Merge duplicates or edit master lists", "Change permissions"],
    needs: "Created by GAO or Super Admin.",
    menu: ["Dashboard", "Verification", "Safeguarding", "Moderation", "Data requests", "Jobs & events", "Documents", "Records", "Engagement", "Consents", "Badges", "Broadcasts", "Audit log", "Teachers"],
  },
  {
    code: "GAO",
    name: "Group Alumni Office",
    emoji: "classical",
    group: "Staff",
    login: "OTP + 2-factor",
    scope: "All 39 campuses",
    persona: "Sanjay Verma",
    can: ["Everything a Campus Admin does, on all campuses", "Merge duplicate records", "Edit master lists (colleges, companies…)", "Create campus staff"],
    cannot: ["Change the permission matrix or settings"],
    needs: "Created by the Super Admin.",
    menu: ["Campus Admin menu", "+ Duplicates", "+ Master lists", "Campus staff"],
  },
  {
    code: "FIN",
    name: "Finance & Commerce",
    emoji: "briefcase",
    group: "Staff",
    login: "OTP + 2-factor",
    scope: "Campuses assigned by Super Admin",
    persona: "Kavita Rao · 2 campuses",
    can: ["See payments (donations, document fees, MyCareerZ)", "Refund with a reason", "Reconcile payments"],
    cannot: ["See the directory or student data"],
    needs: "Created and scoped by the Super Admin.",
    menu: ["Home", "Finance"],
  },
  {
    code: "MCZ",
    name: "MyCareerZ Counsellor",
    emoji: "bulb",
    group: "Staff",
    login: "OTP + 2-factor",
    scope: "Campuses assigned by Super Admin",
    persona: "Aditya Bhatt · 3 campuses",
    can: ["See consented students only", "Confirm, reschedule and close sessions", "Work teacher referrals"],
    cannot: ["See a student once the parent withdraws MyCareerZ consent", "See anything outside assigned campuses"],
    needs: "Parent's MyCareerZ consent for every student they see.",
    menu: ["Home", "MyCareerZ"],
  },
  {
    code: "SAD",
    name: "Super Admin",
    emoji: "key",
    group: "Staff",
    login: "OTP + 2-factor",
    scope: "All 39 campuses (platform owner)",
    persona: "Rahul Menon",
    can: ["Edit the permission matrix", "Settings: student age gate per campus", "Create every staff role and set scopes", "Finance, duplicates, masters, audit"],
    cannot: ["Approve verifications, read chats or broadcast (off by default)", "Loosen the fixed safety limits"],
    needs: "Nobody: top of the chain.",
    menu: ["Admin menu", "Finance", "Permissions", "Settings", "Staff & scopes"],
  },
];

const stats: { emoji: EmojiName; value: string; label: string }[] = [
  { emoji: "people", value: "11", label: "Roles (10 sign-in + Visitor)" },
  { emoji: "clipboard", value: "35", label: "Business rules" },
  { emoji: "key", value: "14", label: "Admin permissions" },
  { emoji: "star", value: "5", label: "Badges" },
  { emoji: "check", value: "3", label: "Consent types" },
  { emoji: "shield", value: "6", label: "Fixed safety rules" },
  { emoji: "school", value: "39", label: "Campuses" },
  { emoji: "play", value: "4", label: "Guided tours" },
];

/* Dependency chains: who unlocks whom. */
type Node = { emoji: EmojiName; label: string; sub?: string };
const chains: { title: string; emoji: EmojiName; nodes: Node[] }[] = [
  {
    title: "A student gets access",
    emoji: "backpack",
    nodes: [
      { emoji: "office", label: "School records", sub: "creates account" },
      { emoji: "lock", label: "Student", sub: "Locked" },
      { emoji: "phone", label: "Parent", sub: "OTP consent" },
      { emoji: "check", label: "Student", sub: "Active" },
    ],
  },
  {
    title: "A student talks to a mentor",
    emoji: "chat",
    nodes: [
      { emoji: "family", label: "Parent", sub: "Mentor contact ON" },
      { emoji: "backpack", label: "Student", sub: "sends message" },
      { emoji: "graduation-cap", label: "Mentor", sub: "badge holder" },
      { emoji: "school", label: "Campus Admin", sub: "watches alerts" },
    ],
  },
  {
    title: "An alumnus gets verified",
    emoji: "graduation-cap",
    nodes: [
      { emoji: "wave", label: "Visitor", sub: "Join" },
      { emoji: "gear", label: "School-record match", sub: "auto check" },
      { emoji: "hourglass", label: "Pending", sub: "if partial" },
      { emoji: "handshake", label: "CAD or 2 batchmates", sub: "approve" },
      { emoji: "check", label: "Verified" },
    ],
  },
  {
    title: "An alumnus becomes a mentor",
    emoji: "handshake",
    nodes: [
      { emoji: "graduation-cap", label: "Verified alumnus", sub: "accepts code" },
      { emoji: "school", label: "Campus Admin", sub: "approves" },
      { emoji: "star", label: "Mentor badge", sub: "visible to students" },
    ],
  },
  {
    title: "A student shows interest in an internship",
    emoji: "rocket",
    nodes: [
      { emoji: "star", label: "Recruiter alumnus", sub: "posts job" },
      { emoji: "school", label: "Campus Admin", sub: "approves" },
      { emoji: "backpack", label: "Student", sub: "interested" },
      { emoji: "teacher", label: "Teacher", sub: "checks parent" },
      { emoji: "office", label: "Company" },
    ],
  },
  {
    title: "A MyCareerZ session",
    emoji: "bulb",
    nodes: [
      { emoji: "family", label: "Parent", sub: "MyCareerZ consent" },
      { emoji: "backpack", label: "Student requests", sub: "or teacher refers" },
      { emoji: "family", label: "Parent pays", sub: "₹2,500" },
      { emoji: "bulb", label: "MCZ counsellor", sub: "confirms" },
      { emoji: "briefcase", label: "Finance", sub: "sees payment" },
    ],
  },
  {
    title: "Who creates staff accounts",
    emoji: "key",
    nodes: [
      { emoji: "key", label: "Super Admin", sub: "everyone" },
      { emoji: "classical", label: "Group Office", sub: "CAD + teachers" },
      { emoji: "school", label: "Campus Admin", sub: "teachers, own campus" },
      { emoji: "teacher", label: "Teacher" },
    ],
  },
];

/* Business rules, grouped. Numbered in order on the page. */
const ruleGroups: { title: string; emoji: EmojiName; rules: string[] }[] = [
  {
    title: "Consent & student access",
    emoji: "phone",
    rules: [
      "Student accounts are created from school records and start Locked.",
      "Students below the campus age gate (default Class 8) are never invited.",
      "Every guardian on record gets the consent link. The first to confirm counts; the others are told nothing more is needed.",
      "The parent proves identity with a 6-digit OTP on the school-registered mobile.",
      "Platform use is required. Mentor contact and MyCareerZ sharing are optional.",
      "Withdrawing Platform use pauses the student immediately. Both guardians are told who changed what.",
      "Every consent stores the notice version, OTP reference and time.",
    ],
  },
  {
    title: "Safeguarding",
    emoji: "shield",
    rules: [
      "Students see only alumni with an active Mentor badge, and only after Mentor contact consent.",
      "Phone numbers (8+ digits), emails, links, @handles and off-platform apps are masked automatically.",
      "Every masked message raises a Safeguarding alert for that campus.",
      "Student–mentor messages can't be deleted by anyone.",
      "If Mentor contact is withdrawn, the conversation turns read-only.",
      "Parents can read and join their child's chats (not start new ones) and report messages.",
      "The Campus Admin can suspend a Mentor badge instantly from an alert.",
    ],
  },
  {
    title: "Alumni verification",
    emoji: "check",
    rules: [
      "A claimed old-portal profile that was verified stays verified.",
      "Pass year + admission number match (name not different) → verified instantly.",
      "Partial match → Pending. Campus Admin approves, rejects with a reason, or asks for info — the alumnus replies and can attach a document (school ID, leaving certificate, mark sheet).",
      "Two verified batchmates from the same campus and batch can vouch → verified.",
    ],
  },
  {
    title: "Badges",
    emoji: "star",
    rules: [
      "Mentor, Recruiter and Service Provider: the alumnus applies, accepts the code, the Campus Admin approves.",
      "Chapter Lead is appointed by an admin and has a monthly announcement limit (default 4, Super Admin sets 0–30).",
      "Donor is given automatically on the first donation.",
    ],
  },
  {
    title: "Jobs & internships",
    emoji: "briefcase",
    rules: [
      "Alumni need a Recruiter badge to post jobs. Every job waits for admin approval.",
      "Contact details are stripped out of job descriptions.",
      "A student's interest goes to the campus teacher, never the employer. Parents are told when it's passed on or declined.",
    ],
  },
  {
    title: "Payments",
    emoji: "envelope",
    rules: [
      "Only alumni can donate (minimum ₹100). Parents can buy services but can't donate.",
      "School documents cost ₹200–750 each, 1–5 copies, +₹150 courier. Paid before processing.",
      "Refunds only by Finance (own campuses) or Super Admin, with a reason. A refund cancels the booking or reopens the document request.",
    ],
  },
  {
    title: "MyCareerZ",
    emoji: "bulb",
    rules: [
      "Needs the parent's MyCareerZ consent. Student requests, parent books and pays ₹2,500, teacher can refer (own campus, one open referral per student).",
      "The counsellor sees only active, consented students on assigned campuses.",
    ],
  },
  {
    title: "Admin & governance",
    emoji: "classical",
    rules: [
      "Campus Admin acts on its own campus only. Group Office and Super Admin act on all 39.",
      "Staff accounts always use 2-factor login.",
      "Every admin action, and every staff view or export of student data, goes in the audit log. Exports need a reason.",
      "The Super Admin edits the permission matrix, but fixed limits can't be loosened.",
      "Staff creation: Campus Admin → teachers · Group Office → campus admins + teachers · Super Admin → everyone.",
      "Moderation target 24 hours. Data & privacy requests due in 30 days.",
    ],
  },
];

const fixedRules: { emoji: EmojiName; text: string }[] = [
  { emoji: "graduation-cap", text: "Students contact only Mentor-badged alumni" },
  { emoji: "hidden", text: "Contact details masked in student chats" },
  { emoji: "lock", text: "Student chats can't be deleted" },
  { emoji: "clipboard", text: "Every staff view or export of student data is logged" },
  { emoji: "key", text: "Staff always use 2-factor login" },
  { emoji: "school", text: "Campus Admins see only their own campus" },
];

type Cap = { key: string; label: string; roles: RoleCode[]; limit?: RoleCode[] };
const STAFF: RoleCode[] = ["TCH", "CAD", "GAO", "FIN", "MCZ", "SAD"];
const caps: Cap[] = [
  { key: "records.view", label: "View alumni records", roles: ["CAD", "GAO", "SAD"] },
  { key: "records.edit", label: "Edit / deactivate records", roles: ["CAD", "GAO", "SAD"] },
  { key: "records.export", label: "Export data (with reason)", roles: ["CAD", "GAO", "SAD"], limit: ["CAD", "GAO", "SAD", "FIN"] },
  { key: "verify", label: "Approve verification", roles: ["CAD", "GAO"] },
  { key: "chats.read", label: "Read student–mentor chats", roles: ["CAD", "GAO"], limit: ["CAD", "GAO", "SAD"] },
  { key: "broadcast.send", label: "Send broadcasts", roles: ["CAD", "GAO"], limit: ["CAD", "GAO", "SAD"] },
  { key: "content.moderate", label: "Moderate reported content", roles: ["CAD", "GAO", "SAD"] },
  { key: "duplicates.merge", label: "Merge duplicates", roles: ["GAO", "SAD"], limit: ["GAO", "SAD"] },
  { key: "masters.edit", label: "Edit master lists", roles: ["GAO", "SAD"] },
  { key: "requests.handle", label: "Data & privacy requests", roles: ["CAD", "GAO", "SAD"] },
  { key: "engagement.log", label: "Log alumni interactions", roles: ["TCH", "CAD", "GAO"] },
  { key: "finance.view", label: "See payments", roles: ["FIN", "SAD"], limit: ["FIN", "SAD", "GAO"] },
  { key: "finance.refund", label: "Refund & reconcile", roles: ["FIN", "SAD"], limit: ["FIN", "SAD"] },
  { key: "mcz.students", label: "See consented students (MCZ)", roles: ["MCZ"], limit: ["MCZ"] },
];

const badges: { emoji: EmojiName; name: string; how: string; gives: string }[] = [
  { emoji: "handshake", name: "Mentor", how: "Apply + accept code → Campus Admin approves", gives: "Visible to consented students; Mentor inbox" },
  { emoji: "briefcase", name: "Recruiter", how: "Apply → Campus Admin approves", gives: "Can post jobs and internships" },
  { emoji: "office", name: "Service Provider", how: "Apply with a listing → Campus Admin approves", gives: "Listed in the Business directory, gets enquiries" },
  { emoji: "megaphone", name: "Chapter Lead", how: "Appointed by an admin for a group", gives: "Group announcements (monthly limit)" },
  { emoji: "heart", name: "Donor", how: "Automatic on first donation", gives: "Optional place on the donor wall" },
];

type Flow = { id: string; title: string; emoji: EmojiName; actors: string; steps: string[]; persona: string };
const flows: Flow[] = [
  {
    id: "consent",
    title: "Parent consent",
    emoji: "phone",
    actors: "Student → Parent",
    persona: "Log in as Aarav (locked), then Neha",
    steps: [
      "School creates Aarav's account from records: Locked.",
      "Both guardians get SMS / WhatsApp / email with a consent link, tagged [Aarav · Class 11].",
      "Neha enters the 6-digit OTP from the Device simulator.",
      "Neha picks Platform use (required), Mentor contact and MyCareerZ (optional).",
      "Aarav's account opens. Rohit is told nothing more is needed.",
      "Either parent can withdraw any consent later in the Consent centre: it applies instantly.",
    ],
  },
  {
    id: "mentor-chat",
    title: "Student asks a mentor",
    emoji: "chat",
    actors: "Student → Mentor → Campus Admin",
    persona: "Log in as Diya, then Meera",
    steps: [
      "Diya opens Find a mentor: only Mentor-badged alumni are listed.",
      "She sends a message. Any phone, email, link or handle is hidden automatically.",
      "The message is stored and can't be deleted.",
      "A masked message (or a report) creates a Safeguarding alert.",
      "Meera reviews the chat and can dismiss, warn or suspend the Mentor badge.",
    ],
  },
  {
    id: "join",
    title: "Alumni join & verification",
    emoji: "graduation-cap",
    actors: "Visitor → Alumni → Campus Admin / batchmates",
    persona: "Use Join, then log in as Meera or Rohan",
    steps: [
      "Visitor opens Join: claim an old-portal profile or sign up fresh.",
      "Email OTP confirms it's them.",
      "Pass year + admission number match school records → Verified instantly.",
      "Partial match → Pending: Meera compares side by side and approves, rejects, or asks for info.",
      "If asked, the alumnus replies from their home page and attaches a document; Meera views it (logged) and decides.",
      "Older batches: two verified batchmates vouch (Rohan can vouch for 2006).",
    ],
  },
  {
    id: "mentor-badge",
    title: "Becoming a mentor",
    emoji: "handshake",
    actors: "Alumni → Campus Admin",
    persona: "Log in as Rohan, then Meera",
    steps: [
      "Rohan opens Become a mentor and accepts the safeguarding code.",
      "The request lands in Meera's Badges queue.",
      "Meera approves: Rohan now appears to consented students.",
      "Meera can suspend the badge any time.",
    ],
  },
  {
    id: "internship",
    title: "Internship interest",
    emoji: "rocket",
    actors: "Recruiter → Campus Admin → Student → Teacher → Parent",
    persona: "Log in as Diya, then Mrs. Fernandes",
    steps: [
      "A Recruiter-badged alumnus posts a job; the Campus Admin approves it.",
      "Diya taps I'm interested: it goes to her campus teacher, not the company.",
      "Mrs. Fernandes checks with the parent, then passes it on or declines with a note.",
      "Diya gets a push; the parent gets WhatsApp when it's passed on or declined.",
    ],
  },
  {
    id: "mcz",
    title: "MyCareerZ session",
    emoji: "bulb",
    actors: "Parent → Student / Teacher → MCZ → Finance",
    persona: "Log in as Neha, then Aditya, then Kavita",
    steps: [
      "Parent has MyCareerZ sharing switched on.",
      "Student requests a session, or the teacher refers them.",
      "Parent books a slot and pays ₹2,500.",
      "Aditya (MyCareerZ) confirms; the parent gets WhatsApp with the time.",
      "Kavita (Finance) sees the payment and can refund with a reason.",
    ],
  },
  {
    id: "money",
    title: "Documents & donations",
    emoji: "envelope",
    actors: "Alumni → Campus Admin → Finance",
    persona: "Log in as Priya, then Meera, then Kavita",
    steps: [
      "Priya requests a document (e.g. Transfer certificate ₹500) and pays.",
      "Meera moves it: processing → ready → dispatched; Priya gets an email each time.",
      "Priya donates (min ₹100) to a fund and gets the Donor badge.",
      "Kavita reconciles payments and can refund.",
    ],
  },
  {
    id: "broadcast",
    title: "Broadcasts & governance",
    emoji: "megaphone",
    actors: "Campus Admin / Group Office / Super Admin",
    persona: "Log in as Meera, Sanjay, then Rahul",
    steps: [
      "Meera writes a broadcast, picks audience (batch, city…) and channels (email, WhatsApp, SMS, push).",
      "Preview shows how many people get it after opt-outs; then send.",
      "Sanjay (Group Office) can target all campuses, merge duplicates and map master lists.",
      "Rahul (Super Admin) changes permissions and settings; every change is audited.",
    ],
  },
];

const demoScript: { who: string; emoji: EmojiName; doWhat: string; show: string }[] = [
  { who: "Visitor", emoji: "wave", doWhat: "Open the landing page", show: "One-glance hero, who it's for, safeguarding" },
  { who: "Aarav (Student)", emoji: "lock", doWhat: "Log in", show: "Account is locked until a parent says yes" },
  { who: "Neha (Parent)", emoji: "phone", doWhat: "Open the consent link, enter OTP, pick consents", show: "Consent is per purpose and instant" },
  { who: "Diya (Student)", emoji: "chat", doWhat: "Message a mentor with a phone number", show: "Number is hidden automatically" },
  { who: "Meera (Campus Admin)", emoji: "school", doWhat: "Open Safeguarding, then Verification", show: "Alert → suspend; side-by-side record check" },
  { who: "Rohan (Alumni)", emoji: "handshake", doWhat: "Vouch, then Become a mentor", show: "Peer verification and badge request" },
  { who: "Sanjay (Group Office)", emoji: "classical", doWhat: "Duplicates, broadcast", show: "All-campus view" },
  { who: "Rahul (Super Admin)", emoji: "key", doWhat: "Permissions page", show: "Matrix + fixed limits that can't be loosened" },
];

/* ================================================================== pieces */

const toc = [
  { id: "overview", label: "Overview", emoji: "sparkles" as EmojiName },
  { id: "roles", label: "Roles", emoji: "people" as EmojiName },
  { id: "depends", label: "Who depends on whom", emoji: "link" as EmojiName },
  { id: "rules", label: "Rules", emoji: "clipboard" as EmojiName },
  { id: "permissions", label: "Permissions", emoji: "key" as EmojiName },
  { id: "badges", label: "Badges", emoji: "star" as EmojiName },
  { id: "flows", label: "Flows", emoji: "point" as EmojiName },
  { id: "demo", label: "Demo script", emoji: "play" as EmojiName },
  { id: "notes", label: "Prototype notes", emoji: "bulb" as EmojiName },
];

function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-24 border-t border-border py-14 first:border-t-0 first:pt-0 ${className}`}>
      <Reveal>{children}</Reveal>
    </section>
  );
}

function RoleExplorer() {
  const [sel, setSel] = useState<RoleCode>("STU");
  const r = roles.find((x) => x.code === sel)!;
  const groups: RoleInfo["group"][] = ["Public", "Community", "Staff"];
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g}>
            <p className="eyebrow mb-2">{g}</p>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {roles
                .filter((x) => x.group === g)
                .map((x) => (
                  <button
                    key={x.code}
                    type="button"
                    onClick={() => setSel(x.code)}
                    aria-pressed={sel === x.code}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-all ${
                      sel === x.code ? "border-primary bg-primary text-primary-fg shadow-md" : "border-border bg-surface hover:border-border-strong"
                    }`}
                  >
                    <Emoji name={x.emoji} size={22} />
                    <span className="flex-1">{x.name}</span>
                    <span className={`font-mono text-xs ${sel === x.code ? "text-primary-fg/70" : "text-subtle"}`}>{x.code}</span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div key={r.code} className="animate-in overflow-hidden rounded-[1.75rem] rounded-tr-[4rem] border border-border bg-surface shadow-md">
        <div className="flex flex-wrap items-center gap-4 border-b border-border bg-bg/60 p-6">
          <span className="grid h-16 w-16 -rotate-6 place-items-center rounded-2xl border border-border bg-surface shadow-md">
            <Emoji name={r.emoji} size={40} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs text-muted">{r.code}</p>
            <h3 className="text-2xl font-semibold">{r.name}</h3>
            {r.persona && <p className="mt-0.5 text-sm text-muted">Demo: {r.persona}</p>}
          </div>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2">
          <Fact emoji="key" title="Login" text={r.login} />
          <Fact emoji="pin" title="Scope" text={r.scope} />
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-3 !text-success">Can</p>
            <ul className="space-y-2">
              {r.can.map((c) => (
                <li key={c} className="flex items-start gap-2 text-body">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-success" strokeWidth={2.5} /> {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3 !text-danger">Can&apos;t</p>
            <ul className="space-y-2">
              {r.cannot.map((c) => (
                <li key={c} className="flex items-start gap-2 text-body">
                  <Lock className="mt-1 h-4 w-4 shrink-0 text-danger" /> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border p-6">
          <p className="flex items-start gap-2 rounded-xl bg-accent-soft px-4 py-3 text-body">
            <Emoji name="link" size={22} />
            <span>
              <b>Depends on:</b> {r.needs}
            </span>
          </p>
          <p className="eyebrow mb-2 mt-5">Menu</p>
          <div className="flex flex-wrap gap-1.5">
            {r.menu.map((m) => (
              <span key={m} className="rounded-full border border-border bg-bg px-2.5 py-1 text-label">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ emoji, title, text }: { emoji: EmojiName; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-surface px-6 py-4">
      <Emoji name={emoji} size={26} />
      <div>
        <p className="text-label text-muted">{title}</p>
        <p className="text-body font-semibold">{text}</p>
      </div>
    </div>
  );
}

function Chain({ title, emoji, nodes }: { title: string; emoji: EmojiName; nodes: Node[] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <p className="flex items-center gap-2 font-semibold">
        <Emoji name={emoji} size={24} /> {title}
      </p>
      <ol className="mt-4 flex flex-wrap items-center gap-2">
        {nodes.map((n, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2">
              <Emoji name={n.emoji} size={22} />
              <span className="leading-tight">
                <span className="block text-sm font-semibold">{n.label}</span>
                {n.sub && <span className="block text-xs text-muted">{n.sub}</span>}
              </span>
            </span>
            {i < nodes.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-accent-strong" strokeWidth={2.5} />}
          </li>
        ))}
      </ol>
    </div>
  );
}

function FlowViewer() {
  const [sel, setSel] = useState(flows[0].id);
  const f = flows.find((x) => x.id === sel)!;
  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        {flows.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setSel(x.id)}
            aria-pressed={sel === x.id}
            className={`inline-flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-3.5 text-sm font-medium transition-all ${
              sel === x.id ? "border-primary bg-primary text-primary-fg shadow-md" : "border-border bg-surface hover:border-border-strong"
            }`}
          >
            <Emoji name={x.emoji} size={20} /> {x.title}
          </button>
        ))}
      </div>
      <div key={f.id} className="animate-in mt-6 rounded-[1.75rem] rounded-tr-[4rem] border border-border bg-surface p-6 shadow-md sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 -rotate-6 place-items-center rounded-2xl border border-border bg-bg shadow-md">
              <Emoji name={f.emoji} size={34} />
            </span>
            <div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="text-sm text-muted">{f.actors}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent-strong">
            <Emoji name="play" size={18} /> {f.persona}
          </span>
        </div>
        <ol className="relative mt-8 space-y-5">
          <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px border-l-2 border-dashed border-border-strong" />
          {f.steps.map((s, i) => (
            <li key={i} className="relative flex gap-4">
              <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-fg ring-4 ring-surface">{i + 1}</span>
              <p className="pt-1 text-body">{s}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function RuleGroups() {
  const [open, setOpen] = useState<string | null>(ruleGroups[0].title);
  let n = 0;
  return (
    <div className="mt-8 grid items-start gap-3 lg:grid-cols-2">
      {ruleGroups.map((g) => {
        const start = n;
        n += g.rules.length;
        const isOpen = open === g.title;
        return (
          <div key={g.title} className={`rounded-2xl border bg-surface transition-colors ${isOpen ? "border-accent shadow-md" : "border-border"}`}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : g.title)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-5 py-4 text-left"
            >
              <Emoji name={g.emoji} size={30} />
              <span className="flex-1">
                <span className="block font-semibold">{g.title}</span>
                <span className="text-label text-muted">
                  Rules {start + 1}–{start + g.rules.length} · {g.rules.length} rules
                </span>
              </span>
              <ChevronDown className={`h-5 w-5 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`} aria-hidden={!isOpen}>
              <ol className="overflow-hidden">
                <div className="space-y-2 px-5 pb-5">
                  {g.rules.map((r, i) => (
                    <li key={i} className="flex gap-3 rounded-xl bg-bg px-3 py-2.5 text-body">
                      <span className="font-mono text-sm font-semibold text-accent-strong">{String(start + i + 1).padStart(2, "0")}</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </div>
              </ol>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================== page */

export default function ProjectUnderstandingPage() {
  return (
    <>
      <PublicHeader />

      {/* Header band */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-0 h-full w-1/2 opacity-60 [background-image:radial-gradient(var(--border-strong)_1.2px,transparent_1.2px)] [background-size:18px_18px]"
        />
        <div aria-hidden className="pointer-events-none absolute -left-10 bottom-0 h-64 w-64 rounded-full bg-accent-soft blur-3xl" />
        <div className="container-page relative py-12 sm:py-16">
          <PillEyebrow emoji="bulb">Project understanding</PillEyebrow>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold sm:text-5xl sm:leading-[1.1]">
            How the VIBGYOR Alumni Platform <Underlined>works</Underlined>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted">Roles, rules, who depends on whom, and every key flow — on one page, ready for the demo.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`${STICKER} flex items-center gap-3 p-4 ${i % 2 ? "rotate-1" : "-rotate-1"}`}>
                <Emoji name={s.emoji} size={34} />
                <div>
                  <p className="font-display text-2xl font-semibold leading-none tabular-nums">{s.value}</p>
                  <p className="mt-1 text-xs text-muted">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-14 lg:grid-cols-[200px_1fr]">
        {/* Table of contents */}
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1">
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text">
                  <Emoji name={t.emoji} size={18} /> {t.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0">
          {/* Overview */}
          <Section id="overview">
            <FunkTitle emoji="sparkles" eyebrow="Overview" title="What this platform is" mark="platform" />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { e: "graduation-cap" as EmojiName, t: "Alumni network", d: "Former students from 39 campuses find each other, join batch groups, share jobs and give back." },
                { e: "backpack" as EmojiName, t: "Safe mentoring", d: "Class 8–12 students get guidance from vetted alumni mentors — only with parent consent." },
                { e: "school" as EmojiName, t: "School control", d: "Campus and group offices verify people, watch safety alerts, broadcast and keep an audit trail." },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-border bg-surface p-5">
                  <Emoji name={x.e} size={40} />
                  <p className="mt-3 font-semibold">{x.t}</p>
                  <p className="mt-1 text-sm text-muted">{x.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
              <p className="font-semibold">The core idea in one line</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {[
                  ["office", "School records"],
                  ["family", "Parent consent"],
                  ["backpack", "Student"],
                  ["handshake", "Verified mentor"],
                  ["shield", "Campus watches"],
                ].map(([e, l], i, a) => (
                  <span key={l} className="flex items-center gap-2">
                    <span className="flex items-center gap-2 rounded-full bg-bg px-3 py-1.5 font-medium">
                      <Emoji name={e as EmojiName} size={20} /> {l}
                    </span>
                    {i < a.length - 1 && <ArrowRight className="h-4 w-4 text-accent-strong" />}
                  </span>
                ))}
              </div>
            </div>
          </Section>

          {/* Roles */}
          <Section id="roles">
            <FunkTitle emoji="people" eyebrow="Roles" title="11 roles, each with its own view" mark="11 roles" />
            <p className="mt-3 text-muted">Pick a role to see how it logs in, what it can and can&apos;t do, and what it depends on.</p>
            <RoleExplorer />
          </Section>

          {/* Dependencies */}
          <Section id="depends">
            <FunkTitle emoji="link" eyebrow="Who depends on whom" title="Every unlock has an owner" mark="an owner" />
            <p className="mt-3 text-muted">Read each chain left to right: nothing on the right happens until the step before it.</p>
            <div className="mt-8 grid gap-4">
              {chains.map((c) => (
                <Chain key={c.title} {...c} />
              ))}
            </div>
          </Section>

          {/* Rules */}
          <Section id="rules">
            <FunkTitle emoji="clipboard" eyebrow="Rules" title="35 rules the system enforces" mark="35 rules" />
            <p className="mt-3 text-muted">Grouped by area. Open a group to read its rules.</p>
            <RuleGroups />

            <div className="mt-10 rounded-[1.75rem] bg-navy p-6 text-white sm:p-8">
              <p className="flex items-center gap-2 text-lg font-semibold">
                <Emoji name="shield" size={30} /> 6 fixed safety rules — no role can switch these off
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {fixedRules.map((f, i) => (
                  <li key={f.text} className={`flex items-center gap-3 rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10 ${i % 2 ? "rotate-[0.5deg]" : "-rotate-[0.5deg]"}`}>
                    <Emoji name={f.emoji} size={28} />
                    <span className="text-sm font-medium">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* Permissions */}
          <Section id="permissions">
            <FunkTitle emoji="key" eyebrow="Permissions" title="14 admin permissions" mark="14" />
            <p className="mt-3 text-muted">Default matrix. The Super Admin can change it on Admin → Permissions, but never beyond the 🔒 limit.</p>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-surface">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-surface-2 text-left text-xs text-muted">
                    <th className="px-4 py-3 font-semibold">Permission</th>
                    {STAFF.map((r) => (
                      <th key={r} className="px-2 py-3 text-center font-semibold">
                        {r}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {caps.map((c) => (
                    <tr key={c.key} className="border-t border-border">
                      <td className="px-4 py-2.5">
                        <span className="font-medium">{c.label}</span>
                        {c.limit && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-xs text-warning">
                            <Lock className="h-3 w-3" /> max: {c.limit.join(", ")}
                          </span>
                        )}
                      </td>
                      {STAFF.map((r) => (
                        <td key={r} className="px-2 py-2.5 text-center">
                          {c.roles.includes(r) ? (
                            <Check className="mx-auto h-4 w-4 text-success" strokeWidth={3} aria-label="Yes" />
                          ) : (
                            <Minus className="mx-auto h-4 w-4 text-border-strong" aria-label="No" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-label text-muted">TCH Teacher · CAD Campus Admin · GAO Group Alumni Office · FIN Finance · MCZ MyCareerZ · SAD Super Admin</p>
          </Section>

          {/* Badges */}
          <Section id="badges">
            <FunkTitle emoji="star" eyebrow="Badges" title="5 badges add abilities to alumni" mark="5 badges" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((b, i) => (
                <div key={b.name} className={`rounded-2xl border border-border bg-surface p-5 shadow-sm transition-transform hover:rotate-0 ${i % 2 ? "lg:rotate-1" : "lg:-rotate-1"}`}>
                  <Emoji name={b.emoji} size={40} />
                  <p className="mt-3 text-lg font-semibold">{b.name}</p>
                  <p className="mt-2 text-sm">
                    <b>How:</b> <span className="text-muted">{b.how}</span>
                  </p>
                  <p className="mt-1 text-sm">
                    <b>Gives:</b> <span className="text-muted">{b.gives}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { e: "check" as EmojiName, t: "Platform use", d: "Required. Without it the student account is locked or paused." },
                { e: "chat" as EmojiName, t: "Mentor contact", d: "Optional. Unlocks Find a mentor and messaging." },
                { e: "bulb" as EmojiName, t: "MyCareerZ sharing", d: "Optional. Lets MyCareerZ see the student and book sessions." },
              ].map((x) => (
                <div key={x.t} className="flex gap-3 rounded-2xl bg-accent-soft p-4">
                  <Emoji name={x.e} size={30} />
                  <div>
                    <p className="text-sm font-semibold">Consent · {x.t}</p>
                    <p className="text-sm text-muted">{x.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Flows */}
          <Section id="flows">
            <FunkTitle emoji="point" eyebrow="Flows" title="8 key flows, step by step" mark="step by step" />
            <FlowViewer />
          </Section>

          {/* Demo script */}
          <Section id="demo">
            <FunkTitle emoji="play" eyebrow="Demo script" title="Suggested order for the demo" mark="the demo" />
            <p className="mt-3 text-muted">
              Use <b>Log in → Demo accounts</b> or <b>Switch role</b> in the top bar. SMS, WhatsApp and email show up in the <b>Device simulator</b> (bottom right).
            </p>
            <ol className="mt-8 space-y-3">
              {demoScript.map((d, i) => (
                <li key={d.who} className="grid items-center gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-[auto_1.1fr_1.3fr_1.3fr]">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-fg">{i + 1}</span>
                  <span className="flex items-center gap-2 font-semibold">
                    <Emoji name={d.emoji} size={26} /> {d.who}
                  </span>
                  <span className="text-sm">{d.doWhat}</span>
                  <span className="text-sm text-muted">→ {d.show}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/demo" className="inline-flex h-[var(--btn-h-lg)] items-center gap-2 rounded-[var(--btn-radius)] bg-primary px-5 font-semibold text-primary-fg">
                Open guided tours <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex h-[var(--btn-h-lg)] items-center gap-2 rounded-[var(--btn-radius)] border border-border-strong bg-surface px-5 font-semibold">
                Demo accounts
              </Link>
            </div>
          </Section>

          {/* Notes */}
          <Section id="notes">
            <FunkTitle emoji="bulb" eyebrow="Prototype notes" title="Good to know before you present" mark="before you present" />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { e: "gear" as EmojiName, t: "Runs in the browser", d: "All data and rules live in the browser. Nothing is sent to a server; reset any time." },
                { e: "people" as EmojiName, t: "Sample people", d: "Every person is fictional. Photos are stock placeholders." },
                { e: "phone" as EmojiName, t: "Messages are simulated", d: "SMS, WhatsApp, email and OTP codes appear in the Device simulator." },
                { e: "hourglass" as EmojiName, t: "Production work still to do", d: "Server-side enforcement, real integrations (ERP, SMS, payments) and automated tests are not in the prototype." },
              ].map((x) => (
                <li key={x.t} className="flex gap-3 rounded-2xl border border-border bg-surface p-4">
                  <Emoji name={x.e} size={32} />
                  <div>
                    <p className="font-semibold">{x.t}</p>
                    <p className="text-sm text-muted">{x.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </main>
      </div>

      <PublicFooter />
    </>
  );
}
