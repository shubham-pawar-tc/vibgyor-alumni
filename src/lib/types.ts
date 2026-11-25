// Role codes follow RFQ §5.1
export type Role =
  | "VIS"
  | "STU"
  | "PAR"
  | "ALP"
  | "ALU"
  | "TCH"
  | "CAD"
  | "GAO"
  | "FIN"
  | "MCZ"
  | "SAD";

// Badges follow RFQ §5.2
export type BadgeType = "Mentor" | "ChapterLead" | "Recruiter" | "ServiceProvider" | "Donor";

export interface BadgeHolding {
  type: BadgeType;
  status: "active" | "suspended";
  since: string;
}

export interface Campus {
  id: string;
  name: string;
  city: string;
}

export interface ThreeC {
  country: string;
  course: string;
  college: string;
}

export type StudentStatus = "awaiting_consent" | "active" | "paused" | "not_eligible";

export interface User {
  id: string;
  name: string;
  role: Role;
  campusIds: string[]; // staff scope; for alumni/students their own campus
  email: string;
  mobile: string;
  title?: string; // job title / designation shown on cards
  // Alumni
  batch?: number;
  college?: string;
  country?: string;
  course?: string;
  field?: string;
  company?: string;
  city?: string;
  bio?: string;
  badges?: BadgeHolding[];
  codeOfConductAcceptedAt?: string;
  // Students
  className?: number;
  studentStatus?: StudentStatus;
  parentIds?: string[];
  threeC?: ThreeC[];
  interests?: string[];
  dob?: string;
  // Parents
  childIds?: string[];
  // Phase 2: rich alumni profile (B1–B8)
  profile?: AlumniProfile;
  // Phase 3
  deactivated?: boolean;
  mergedFrom?: string[];
}

/* ---------------------------- Phase 2 types ---------------------------- */

/** Who can see a profile field (A10 per-field privacy) */
export type Visibility = "alumni" | "batch" | "private";
export type PrivateField = "email" | "mobile" | "company" | "city" | "work" | "education";

export interface WorkItem {
  id: string;
  company: string;
  title: string;
  from: number;
  to?: number; // undefined = present
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  from: number;
  to: number;
}

export interface AlumniProfile {
  headline?: string;
  work: WorkItem[];
  education: EducationItem[];
  achievements: string[];
  skills: string[];
  linkedin?: string;
  resumeName?: string;
  privacy: Record<PrivateField, Visibility>;
  openTo: { mentoring: boolean; hiring: boolean; speaking: boolean };
}

export type JobType = "Full-time" | "Internship" | "Part-time" | "Contract";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  remote: boolean;
  description: string;
  postedBy: string;
  campusId: string; // approving campus
  forStudents: boolean; // visible to students (internships / shadowing)
  status: "pending" | "approved" | "rejected" | "closed";
  at: string;
  decidedBy?: string;
  interested: { userId: string; at: string; note?: string }[];
}

export type RsvpStatus = "going" | "maybe" | "no";

export interface VaaEvent {
  id: string;
  title: string;
  kind: "Reunion" | "Webinar" | "Career talk" | "Meetup";
  description: string;
  campusIds: string[] | "all";
  audience: ("ALU" | "STU" | "PAR")[];
  start: string;
  end: string;
  venue: string;
  online: boolean;
  capacity: number;
  createdBy: string;
  createdAt: string;
  rsvps: { userId: string; status: RsvpStatus; at: string; guests?: number }[];
}

export interface GroupPost {
  id: string;
  groupId: string; // "campus:c01" or "batch:c01:2016"
  authorId: string;
  text: string;
  at: string;
  likes: string[];
}

export interface DmThread {
  id: string;
  members: [string, string];
  createdAt: string;
}

export interface DmMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  at: string;
}

export interface Invite {
  id: string;
  by: string;
  to: string;
  channel: "email" | "whatsapp";
  at: string;
  joined: boolean;
}

export type ConsentPurpose = "platform" | "mentor" | "mcz";

export interface Consent {
  id: string;
  studentId: string;
  givenBy: string; // parent id, or the student if 18+
  purpose: ConsentPurpose;
  status: "granted" | "withdrawn";
  noticeVersion: string;
  channel: "SMS OTP" | "Email OTP";
  otpRef: string;
  at: string;
  withdrawnAt?: string;
}

export interface Conversation {
  id: string;
  studentId: string;
  mentorId: string;
  campusId: string; // student's campus – who reviews it
  createdAt: string;
  topic: string;
}

export type MaskKind = "phone" | "email" | "link" | "handle" | "app";

export interface Message {
  id: string;
  convId: string;
  senderId: string;
  text: string; // already masked
  maskedKinds: MaskKind[];
  at: string;
}

export interface Report {
  id: string;
  kind: "message" | "profile" | "post" | "job";
  messageId?: string;
  postId?: string;
  jobId?: string;
  convId?: string;
  subjectUserId: string; // whose content is reported
  reporterId: string | "system";
  reason: string;
  campusId: string;
  at: string;
  status: "open" | "dismissed" | "actioned";
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export type MatchField = "match" | "partial" | "mismatch" | "missing";

export interface VerificationRequest {
  id: string;
  userId: string;
  name: string;
  campusId: string;
  passYear: number;
  admissionNo: string;
  email: string;
  submittedAt: string;
  method: "self_signup" | "claim";
  closestRecord?: { admissionNo: string; name: string; passYear: number; campusId: string };
  fieldChecks?: { name: MatchField; passYear: MatchField; admissionNo: MatchField; campus: MatchField };
  vouches: { by: string; byName: string; at: string }[];
  status: "pending" | "auto_approved" | "approved" | "peer_approved" | "rejected" | "info_requested";
  decidedBy?: string;
  decidedAt?: string;
  note?: string;
}

export interface BadgeRequest {
  id: string;
  userId: string;
  badge: BadgeType;
  campusId: string;
  motivation: string;
  codeAcceptedAt: string;
  at: string;
  status: "pending" | "approved" | "rejected";
}

export type Channel = "email" | "whatsapp" | "push" | "sms";

export interface Broadcast {
  id: string;
  title: string;
  createdBy: string;
  campusIds: string[] | "all";
  batchFrom: number;
  batchTo: number;
  countries: string[] | "all";
  segment: "all_verified" | "mentors";
  channels: Channel[];
  waTemplate?: string;
  subject: string;
  body: string;
  audience: number;
  reach: Partial<Record<Channel, number>>;
  scheduledFor?: string;
  status: "scheduled" | "sending" | "delivered";
  createdAt: string;
  stats?: Partial<Record<Channel, { sent: number; delivered: number; opened: number; clicked: number }>>;
}

export interface OutboxMsg {
  id: string;
  channel: Channel;
  to: string; // display recipient
  toUserId?: string;
  body: string;
  link?: { label: string; href: string };
  at: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string | "system";
  action: string;
  target: string;
  campusId?: string;
  detail?: string;
  category: "consent" | "safeguarding" | "verification" | "broadcast" | "data_access" | "auth" | "admin" | "community";
}

export interface State {
  version: number;
  currentUserId: string | null;
  users: User[];
  consents: Consent[];
  conversations: Conversation[];
  messages: Message[];
  reports: Report[];
  verifications: VerificationRequest[];
  badgeRequests: BadgeRequest[];
  broadcasts: Broadcast[];
  outbox: OutboxMsg[];
  audit: AuditEntry[];
  campusMinClass: Record<string, number>;
  pendingOtps: Record<string, string>; // key -> code
  // Phase 2
  jobs: Job[];
  events: VaaEvent[];
  posts: GroupPost[];
  dmThreads: DmThread[];
  dms: DmMessage[];
  invites: Invite[];
  // Phase 3
  engagements: EngagementEntry[];
  dataRequests: DataRequest[];
  masters: Record<MasterKind, MasterItem[]>;
  permissions: Record<Capability, Role[]>;
}

/* ---------------------------- Phase 3 types ---------------------------- */

export type EngagementMode = "Call" | "Email" | "Meeting" | "Event" | "WhatsApp";
export type EngagementCategory = "Mentoring" | "Event" | "Placement" | "Fundraising" | "Data update" | "General";

/** K1 engagement activity log */
export interface EngagementEntry {
  id: string;
  alumniId: string;
  staffId: string;
  campusId: string;
  mode: EngagementMode;
  category: EngagementCategory;
  note: string;
  at: string;
  source: "manual" | "bulk";
}

/** A11 / CS-11 / CS-15 data-subject requests */
export interface DataRequest {
  id: string;
  type: "access" | "correction" | "deletion" | "complaint";
  subjectId: string; // whose data
  requesterId: string; // who asked (the person, or the parent for a minor)
  campusId: string;
  details: string;
  at: string;
  due: string;
  status: "open" | "in_progress" | "done" | "rejected";
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export type MasterKind = "college" | "programme" | "industry";

/** L5 data standards */
export interface MasterItem {
  id: string;
  name: string;
  aliases: string[];
}

/** A6 permissions matrix */
export type Capability =
  | "records.view"
  | "records.edit"
  | "records.export"
  | "verify"
  | "chats.read"
  | "broadcast.send"
  | "content.moderate"
  | "duplicates.merge"
  | "masters.edit"
  | "requests.handle"
  | "engagement.log";
