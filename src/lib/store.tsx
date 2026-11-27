"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { campusName as campusNameFor, campuses as allCampuses, consentPurposes, COURIER_FEE, DOC_FEES, HARD_LIMITS, MCZ_SESSION_FEE, createSeedState, masterUserKey, REQUEST_DAYS, erpRecords, ERP_EARLIEST_YEAR, migratedRecords, NOTICE_VERSION, STATE_VERSION } from "./data";
import { maskContacts } from "./mask";
import type {
  Capability,
  DataRequest,
  EngagementEntry,
  MasterKind,
  Role,
  AlumniProfile,
  Job,
  RsvpStatus,
  VaaEvent,
  AuditEntry,
  BadgeType,
  Booking,
  BusinessListing,
  DocRequest,
  DocType,
  Payment,
  Broadcast,
  ConsentPurpose,
  InterestStatus,
  MatchField,
  OutboxMsg,
  State,
  User,
  VerificationRequest,
  VerificationDoc,
} from "./types";
import { childTag, firstName, maskMobile, uid } from "./utils";
import { check } from "./validate";

const KEY = "vaa-prototype-state";

/* ------------------------------ selectors ------------------------------ */

export function hasConsent(s: State, studentId: string, purpose: ConsentPurpose) {
  const recs = s.consents.filter((c) => c.studentId === studentId && c.purpose === purpose);
  const latest = recs.sort((a, b) => Date.parse(b.withdrawnAt ?? b.at) - Date.parse(a.withdrawnAt ?? a.at))[0];
  return latest?.status === "granted";
}

export function latestConsent(s: State, studentId: string, purpose: ConsentPurpose) {
  return s.consents
    .filter((c) => c.studentId === studentId && c.purpose === purpose)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))[0];
}

/** A6: does this user's role hold a capability in the (editable) permissions matrix? */
/** Default onboarding message. Placeholders: {{first_name}}, {{login_id}}, {{login_link}}, {{campus}}, {{batch}}. */
export const LOGIN_INVITE_TEMPLATE = `Hi {{first_name}},

Your VIBGYOR Alumni Association profile ({{campus}}, Batch {{batch}}) is ready. Sign in here: {{login_link}}

How to sign in (no password needed):
1. Open the link above, or go to vaa.vibgyor.in/login
2. Your login ID is {{login_id}} (already filled in if you use the link)
3. Tap "Send code" and enter the 6-digit code we send you
4. Check your details, set your privacy, and say hello to your batch

We'll never ask for a password or the code over phone or email.

VIBGYOR Alumni Office`;

export function loginInviteBody(template: string, u: User) {
  const link = `https://vaa.vibgyor.in/login?id=${encodeURIComponent(u.email)}`;
  let body = template
    .replace(/{{first_name}}/g, firstName(u.name))
    .replace(/{{login_id}}/g, u.email)
    .replace(/{{login_link}}/g, link)
    .replace(/{{campus}}/g, campusNameFor(u.campusIds[0]))
    .replace(/{{batch}}/g, String(u.batch ?? ""));
  if (u.role === "ALP") body += "\n\nNote: your campus is still verifying you. You can complete your profile meanwhile; the rest opens once you're verified.";
  return body;
}

/** Age gate (Settings): a student below their campus's minimum class can't be activated. Already-active accounts are not affected. */
const campusIdsAll = () => allCampuses.map((c) => c.id);

/** Which staff roles a person may create or edit (Annex B "How access is given"). */
export function manageableRoles(r?: Role): Role[] {
  if (r === "SAD") return ["TCH", "CAD", "GAO", "FIN", "MCZ", "SAD"];
  if (r === "GAO") return ["TCH", "CAD"];
  if (r === "CAD") return ["TCH"];
  return [];
}

export function belowAgeGate(s: State, u: User | undefined) {
  if (!u || u.role !== "STU" || u.studentStatus === "active") return false;
  return u.studentStatus === "not_eligible" || (u.className ?? 0) < (s.campusMinClass?.[u.campusIds[0]] ?? 8);
}

export function can(s: State, u: User | undefined, cap: Capability) {
  return !!u && (s.permissions?.[cap] ?? []).includes(u.role);
}

export function activeBadge(u: User | undefined, type: BadgeType) {
  return !!u?.badges?.some((b) => b.type === type && b.status === "active");
}

export function hasBadge(u: User | undefined, type: BadgeType) {
  return u?.badges?.find((b) => b.type === type);
}

function normName(n: string) {
  return n.toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, " ").trim();
}

function nameMatch(a: string, b: string): MatchField {
  const x = normName(a);
  const y = normName(b);
  if (x === y) return "match";
  const xs = x.split(" ");
  const ys = y.split(" ");
  if (xs.some((p) => p.length > 2 && ys.includes(p))) return "partial";
  return "mismatch";
}

function admissionMatch(a: string, b: string): MatchField {
  const x = a.toUpperCase().replace(/\s/g, "");
  const y = b.toUpperCase().replace(/\s/g, "");
  if (x === y) return "match";
  if (!x) return "missing";
  // same prefix and same digits in a different order (typo)
  if (x.slice(0, -4) === y.slice(0, -4) && [...x.slice(-4)].sort().join() === [...y.slice(-4)].sort().join()) return "partial";
  return "mismatch";
}

/* ------------------------------ context ------------------------------ */

export interface VerificationInput {
  name: string;
  email: string;
  mobile: string;
  campusId: string;
  passYear: number;
  admissionNo: string;
  migratedId?: string;
  /** Alumnus who invited this person (from /join?ref=). */
  ref?: string;
}

export interface VerificationResult {
  outcome: "auto_approved" | "claimed_verified" | "pending";
  userId: string;
  request: VerificationRequest;
}

interface Ctx {
  state: State;
  hydrated: boolean;
  me: User | undefined;
  user: (id: string) => User | undefined;
  login: (userId: string) => void;
  logout: () => void;
  reset: () => void;
  log: (e: Omit<AuditEntry, "id" | "at">) => void;
  pushOutbox: (m: Omit<OutboxMsg, "id" | "at">) => void;
  clearOutbox: () => void;
  // consent
  requestConsent: (studentId: string, actorId: string) => void;
  requestMentorPermission: (studentId: string) => void;
  sendOtp: (key: string, to: string, toUserId: string | undefined, purpose: string) => string;
  checkOtp: (key: string, code: string) => boolean;
  /** Demo only: read the latest code so the UI can autofill it */
  peekOtp: (key: string) => string | undefined;
  grantConsents: (studentId: string, parentId: string, choices: Record<ConsentPurpose, boolean>) => void;
  setConsent: (studentId: string, purpose: ConsentPurpose, grant: boolean, actorId: string) => void;
  // safeguarding
  startConversation: (studentId: string, mentorId: string, topic: string, text: string) => string;
  sendMessage: (convId: string, senderId: string, raw: string) => void;
  reportMessage: (messageId: string, reporterId: string, reason: string) => void;
  resolveReport: (reportId: string, action: "dismiss" | "warn" | "suspend", actorId: string) => void;
  setBadgeStatus: (userId: string, type: BadgeType, status: "active" | "suspended", actorId: string) => void;
  logView: (actorId: string, target: string, campusId?: string) => void;
  // verification
  findMigrated: (emailOrMobile: string) => (typeof migratedRecords)[number] | undefined;
  submitVerification: (input: VerificationInput) => VerificationResult;
  decideVerification: (id: string, decision: "approved" | "rejected" | "info_requested", actorId: string, note?: string) => void;
  vouch: (id: string, voucherId: string) => void;
  answerInfoRequest: (id: string, userId: string, reply: string, doc?: VerificationDoc) => void;
  viewVerificationDoc: (reqId: string, docId: string, actorId: string) => void;
  applyBadge: (userId: string, badge: BadgeType, motivation: string, listing?: BusinessListing) => void;
  // Annex B: badges
  appointChapterLead: (userId: string, groupId: string, actorId: string) => { ok: boolean; error?: string };
  revokeBadge: (userId: string, type: BadgeType, actorId: string) => void;
  setChapterLimit: (n: number, actorId: string) => void;
  announce: (groupId: string, authorId: string, text: string) => { ok: boolean; error?: string };
  removePost: (postId: string, actorId: string) => void;
  sendEnquiry: (providerId: string, fromId: string, text: string) => void;
  setUserFlags: (userId: string, flags: { mczGuide?: boolean; donorWall?: boolean }) => void;
  switchContext: (toUserId: string) => void;
  // Annex B: commerce and documents
  donate: (userId: string, amount: number, fund: string, wall: boolean) => { ok: boolean; error?: string };
  requestDocument: (userId: string, doc: DocType, copies: number, delivery: DocRequest["delivery"]) => string | undefined;
  payDocument: (reqId: string, userId: string) => void;
  advanceDocument: (reqId: string, status: DocRequest["status"], actorId: string, note?: string) => void;
  refundPayment: (paymentId: string, reason: string, actorId: string) => { ok: boolean; error?: string };
  reconcilePayments: (ids: string[], actorId: string) => void;
  // Annex B: MyCareerZ
  bookMcz: (b: { studentId: string; bookedBy: string; topic: string; slot: string }) => { ok: boolean; error?: string };
  referToMcz: (studentId: string, teacherId: string, topic: string, note: string) => { ok: boolean; error?: string };
  updateBooking: (id: string, status: Booking["status"], actorId: string, slot?: string) => void;
  decideBadge: (id: string, approve: boolean, actorId: string) => void;
  // broadcast
  createBroadcast: (b: Omit<Broadcast, "id" | "createdAt" | "status" | "stats">) => void;
  setMinClass: (campusId: string, cls: number, actorId: string) => void;
  // Phase 2 – community
  updateProfile: (userId: string, profile: Partial<AlumniProfile>, fields?: Partial<User>) => void;
  postJob: (j: Omit<Job, "id" | "at" | "status" | "interested" | "decidedBy">) => void;
  decideJob: (id: string, approve: boolean, actorId: string) => void;
  closeJob: (id: string, actorId: string) => void;
  markInterest: (jobId: string, userId: string, note?: string) => void;
  setInterestStatus: (jobId: string, studentId: string, status: InterestStatus, note: string, actorId: string) => void;
  saveStaff: (u: { id?: string; name: string; email: string; mobile: string; role: Role; campusIds: string[] }, actorId: string) => { ok: boolean; error?: string };
  resetTwoFactor: (userId: string, actorId: string) => void;
  createEvent: (e: Omit<VaaEvent, "id" | "createdAt" | "rsvps">) => void;
  rsvp: (eventId: string, userId: string, status: RsvpStatus, guests?: number) => void;
  joinEvent: (eventId: string, userId: string) => void;
  addPost: (groupId: string, authorId: string, text: string) => void;
  toggleLike: (postId: string, userId: string) => void;
  openDm: (a: string, b: string) => string;
  sendDm: (threadId: string, senderId: string, text: string) => void;
  sendInvite: (by: string, to: string, channel: "email" | "whatsapp") => void;
  // Phase 3 – administration
  editUser: (userId: string, fields: Partial<User>, actorId: string) => void;
  setDeactivated: (userId: string, off: boolean, actorId: string) => void;
  sendLoginInvites: (userIds: string[], channels: ("email" | "whatsapp" | "sms")[], template: string, actorId: string) => { sent: number; skipped: number };
  logExport: (actorId: string, target: string, reason: string, campusId?: string) => void;
  addEngagements: (entries: Omit<EngagementEntry, "id">[], actorId: string) => void;
  mergeUsers: (keepId: string, dropId: string, chosen: Partial<User>, actorId: string) => void;
  addMasterItem: (kind: MasterKind, name: string, actorId: string) => void;
  mapValue: (kind: MasterKind, raw: string, itemId: string, actorId: string) => void;
  removeAlias: (kind: MasterKind, itemId: string, alias: string) => void;
  reportContent: (kind: "post" | "job" | "profile", targetId: string, reporterId: string, reason: string) => void;
  resolveModeration: (reportId: string, action: "dismiss" | "remove" | "warn", actorId: string) => void;
  submitDataRequest: (type: DataRequest["type"], subjectId: string, requesterId: string, details: string) => void;
  updateDataRequest: (id: string, status: DataRequest["status"], actorId: string, resolution?: string) => void;
  setPermission: (cap: Capability, role: Role, on: boolean, actorId: string) => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(() => createSeedState());
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        if (parsed.version === STATE_VERSION) setState(parsed);
      }
    } catch {
      /* storage unavailable – run in memory */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const now = () => new Date().toISOString();

  const user = useCallback((id: string) => stateRef.current.users.find((u) => u.id === id), []);

  const log = useCallback((e: Omit<AuditEntry, "id" | "at">) => {
    setState((s) => ({ ...s, audit: [{ ...e, id: uid("a"), at: now() }, ...s.audit] }));
  }, []);

  const pushOutbox = useCallback((m: Omit<OutboxMsg, "id" | "at">) => {
    setState((s) => ({ ...s, outbox: [{ ...m, id: uid("o"), at: now() }, ...s.outbox].slice(0, 60) }));
  }, []);

  const api: Ctx = useMemo(() => {
    const getUser = (id: string) => stateRef.current.users.find((u) => u.id === id);

    return {
      state,
      hydrated,
      me: state.currentUserId ? state.users.find((u) => u.id === state.currentUserId) : undefined,
      user,
      log,
      pushOutbox,
      login: (userId) => {
        setState((s) => ({ ...s, currentUserId: userId }));
        log({ actorId: userId, action: "Signed in", target: getUser(userId)?.name ?? userId, category: "auth" });
      },
      logout: () => setState((s) => ({ ...s, currentUserId: null })),
      reset: () => {
        const fresh = createSeedState();
        setState(fresh);
      },
      clearOutbox: () => setState((s) => ({ ...s, outbox: [] })),

      /* ---------------- consent ---------------- */
      requestConsent: (studentId, actorId) => {
        const stu = getUser(studentId);
        if (!stu || belowAgeGate(stateRef.current, stu)) return;
        // Every guardian on record gets the request; the first one to verify and confirm counts.
        const parents = (stu.parentIds ?? []).map((id) => getUser(id)).filter((u): u is User => !!u);
        if (parents.length === 0) return;
        const sn = firstName(stu.name);
        const tag = childTag(stu);
        parents.forEach((parent) => {
          const href = `/consent/${studentId}?p=${parent.id}`;
          const fn = firstName(parent.name);
          pushOutbox({
            channel: "sms",
            to: `${parent.name} · ${maskMobile(parent.mobile)}`,
            toUserId: parent.id,
            body: `${tag} VIBGYOR: Dear ${fn}, ${sn}'s school has invited ${sn} to the VIBGYOR Alumni Platform. Please review and give consent: vaa.vibgyor.in/c/${studentId}`,
            link: { label: "Open consent link", href },
          });
          pushOutbox({
            channel: "whatsapp",
            to: `${parent.name} · ${maskMobile(parent.mobile)}`,
            toUserId: parent.id,
            body: `${tag} Hello ${fn}, VIBGYOR ${sn}'s campus needs your permission before ${sn}'s student account on the VIBGYOR Alumni Platform is switched on. It takes 2 minutes.`,
            link: { label: "Review & consent", href },
          });
          pushOutbox({
            channel: "email",
            to: `${parent.name} · ${parent.email}`,
            toUserId: parent.id,
            body: `Subject: ${tag} Your consent is needed for ${stu.name}\n\nWe will only switch on ${sn}'s account after you confirm, using a one-time code sent to the mobile number registered with the school.`,
            link: { label: "Review & consent", href },
          });
        });
        log({
          actorId,
          action: "Consent request sent",
          target: `${stu.name} → ${parents.map((p) => p.name).join(", ")}`,
          campusId: stu.campusIds[0],
          category: "consent",
          detail: "SMS, WhatsApp, email",
        });
      },
      requestMentorPermission: (studentId) => {
        const stu = getUser(studentId);
        if (!stu || stu.studentStatus !== "active") return;
        (stu.parentIds ?? []).map((id) => getUser(id)).forEach((p) => {
          if (!p) return;
          pushOutbox({
            channel: "whatsapp",
            to: `${p.name} · ${maskMobile(p.mobile)}`,
            toUserId: p.id,
            body: `${childTag(stu)} ${firstName(stu.name)} would like to talk to approved alumni mentors on the VIBGYOR Alumni Platform. Every message is recorded, contact details are hidden, and you can read and join the conversations. Switch on "Mentor contact" if you agree.`,
            link: { label: "Open consent centre", href: `/portal/consent?child=${stu.id}` },
          });
        });
        log({ actorId: studentId, action: "Asked parent for mentor contact", target: stu.name, campusId: stu.campusIds[0], category: "consent" });
      },
      sendOtp: (key, to, toUserId, purpose) => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        setState((s) => ({ ...s, pendingOtps: { ...s.pendingOtps, [key]: code } }));
        pushOutbox({
          channel: to.includes("@") ? "email" : "sms",
          to,
          toUserId,
          body: `${code} is your VIBGYOR verification code for ${purpose}. It expires in 10 minutes. Do not share it with anyone.`,
        });
        return code;
      },
      checkOtp: (key, code) => stateRef.current.pendingOtps[key] === code.trim(),
      peekOtp: (key) => stateRef.current.pendingOtps[key],
      grantConsents: (studentId, parentId, choices) => {
        if (belowAgeGate(stateRef.current, getUser(studentId))) return;
        const at = now();
        const otpRef = `OTP-${Math.floor(10000 + Math.random() * 89999)}`;
        setState((s) => {
          const recs = (Object.keys(choices) as ConsentPurpose[])
            .filter((p) => choices[p])
            .map((purpose) => ({
              id: uid("con"),
              studentId,
              givenBy: parentId,
              purpose,
              status: "granted" as const,
              noticeVersion: NOTICE_VERSION,
              channel: "SMS OTP" as const,
              otpRef,
              at,
            }));
          return {
            ...s,
            consents: [...s.consents, ...recs],
            users: s.users.map((u) =>
              u.id === studentId && choices.platform ? { ...u, studentStatus: "active" } : u
            ),
          };
        });
        const stu = getUser(studentId);
        const par = getUser(parentId);
        const given = (Object.keys(choices) as ConsentPurpose[]).filter((p) => choices[p]);
        log({
          actorId: parentId,
          action: "Parental consent recorded",
          target: stu?.name ?? studentId,
          campusId: stu?.campusIds[0],
          category: "consent",
          detail: `${given.join(", ")} · ${NOTICE_VERSION} · ${otpRef}`,
        });
        if (par && stu) {
          const tag = childTag(stu);
          pushOutbox({
            channel: "whatsapp",
            to: `${par.name} · ${maskMobile(par.mobile)}`,
            toUserId: par.id,
            body: `${tag} Thank you ${firstName(par.name)}. Your consent for ${stu.name} is recorded (ref ${otpRef}). You can change or withdraw it any time from the Parent portal.`,
          });
          // Let the other guardian(s) know, so nobody is asked twice.
          (stu.parentIds ?? [])
            .filter((id) => id !== par.id)
            .map((id) => getUser(id))
            .forEach((other) => {
              if (!other) return;
              pushOutbox({
                channel: "whatsapp",
                to: `${other.name} · ${maskMobile(other.mobile)}`,
                toUserId: other.id,
                body: `${tag} ${par.name} has given consent for ${stu.name} (ref ${otpRef}). Nothing more is needed from you. You can see or change it in the Parent portal.`,
              });
            });
        }
      },
      setConsent: (studentId, purpose, grant, actorId) => {
        const at = now();
        setState((s) => {
          let consents = s.consents;
          if (grant) {
            consents = [
              ...consents,
              {
                id: uid("con"),
                studentId,
                givenBy: actorId,
                purpose,
                status: "granted",
                noticeVersion: NOTICE_VERSION,
                channel: "SMS OTP",
                otpRef: `OTP-${Math.floor(10000 + Math.random() * 89999)}`,
                at,
              },
            ];
          } else {
            consents = consents.map((c) =>
              c.studentId === studentId && c.purpose === purpose && c.status === "granted"
                ? { ...c, status: "withdrawn", withdrawnAt: at }
                : c
            );
          }
          const users = s.users.map((u) => {
            if (u.id !== studentId || purpose !== "platform") return u;
            return { ...u, studentStatus: grant ? ("active" as const) : ("paused" as const) };
          });
          return { ...s, consents, users };
        });
        const stu = getUser(studentId);
        const actor = getUser(actorId);
        if (stu && actor?.role === "PAR") {
          const tag = childTag(stu);
          (stu.parentIds ?? []).map((id) => getUser(id)).forEach((p) => {
            if (!p) return;
            pushOutbox({
              channel: "whatsapp",
              to: `${p.name} · ${maskMobile(p.mobile)}`,
              toUserId: p.id,
              body: `${tag} ${p.id === actor.id ? "You have" : `${actor.name} has`} ${grant ? "allowed" : "withdrawn"} "${consentPurposes[purpose].short}" for ${firstName(stu.name)}. This took effect immediately.`,
            });
          });
        }
        log({
          actorId,
          action: grant ? "Consent given" : "Consent withdrawn",
          target: stu?.name ?? studentId,
          campusId: stu?.campusIds[0],
          category: "consent",
          detail: `${purpose} · effective immediately`,
        });
      },

      /* ---------------- safeguarding ---------------- */
      startConversation: (studentId, mentorId, topic, text) => {
        const existing = stateRef.current.conversations.find((c) => c.studentId === studentId && c.mentorId === mentorId);
        const id = existing?.id ?? uid("conv");
        const stu = getUser(studentId);
        if (!existing) {
          setState((s) => ({
            ...s,
            conversations: [
              ...s.conversations,
              { id, studentId, mentorId, campusId: stu?.campusIds[0] ?? "c01", createdAt: now(), topic },
            ],
          }));
          log({
            actorId: studentId,
            action: "Conversation started",
            target: `${stu?.name} ↔ ${getUser(mentorId)?.name}`,
            campusId: stu?.campusIds[0],
            category: "safeguarding",
          });
        }
        // send after conversation exists
        setTimeout(() => api.sendMessage(id, studentId, text), 0);
        return id;
      },
      sendMessage: (convId, senderId, raw) => {
        const { text, kinds } = maskContacts(raw.trim());
        if (!text) return;
        const id = uid("msg");
        const conv = stateRef.current.conversations.find((c) => c.id === convId);
        setState((s) => ({
          ...s,
          messages: [...s.messages, { id, convId, senderId, text, maskedKinds: kinds, at: now() }],
        }));
        if (kinds.length && conv) {
          const sender = getUser(senderId);
          setState((s) => ({
            ...s,
            reports: [
              {
                id: uid("rep"),
                kind: "message",
                messageId: id,
                convId,
                subjectUserId: senderId,
                reporterId: "system",
                reason: `Auto-flag: contact details blocked (${kinds.join(", ")})`,
                campusId: conv.campusId,
                at: now(),
                status: "open",
              },
              ...s.reports,
            ],
          }));
          log({
            actorId: "system",
            action: "Contact details masked",
            target: `Message from ${sender?.name}`,
            campusId: conv.campusId,
            category: "safeguarding",
            detail: kinds.join(", "),
          });
        }
        // Notify the other party (in-app/push simulation)
        if (conv) {
          const sender = getUser(senderId);
          const stu = getUser(conv.studentId);
          if (senderId !== conv.mentorId) {
            // student or parent wrote → tell the mentor
            const mentor = getUser(conv.mentorId);
            const who = sender?.role === "PAR" ? `${sender.name} (${stu ? firstName(stu.name) + "'s " : ""}parent)` : `${sender?.name} (student)`;
            if (mentor)
              pushOutbox({
                channel: "push",
                to: mentor.name,
                toUserId: mentor.id,
                body: `New message from ${who} · open the VAA app to reply`,
                link: { label: "Open messages", href: `/portal/messages?c=${convId}` },
              });
          } else {
            // mentor wrote → tell any parent who has joined this conversation
            const joined = new Set(stateRef.current.messages.filter((m) => m.convId === convId).map((m) => m.senderId));
            (stu?.parentIds ?? [])
              .filter((pid) => joined.has(pid))
              .map((pid) => getUser(pid))
              .forEach((p) => {
                if (!p || !stu) return;
                pushOutbox({
                  channel: "push",
                  to: p.name,
                  toUserId: p.id,
                  body: `${childTag(stu)} ${sender?.name} (mentor) replied in ${firstName(stu.name)}'s conversation`,
                  link: { label: "Open mentor chats", href: `/portal/child-chats?child=${stu.id}` },
                });
              });
          }
        }
      },
      reportMessage: (messageId, reporterId, reason) => {
        const msg = stateRef.current.messages.find((m) => m.id === messageId);
        const conv = msg && stateRef.current.conversations.find((c) => c.id === msg.convId);
        if (!msg || !conv) return;
        setState((s) => ({
          ...s,
          reports: [
            {
              id: uid("rep"),
              kind: "message",
              messageId,
              convId: conv.id,
              subjectUserId: msg.senderId,
              reporterId,
              reason,
              campusId: conv.campusId,
              at: now(),
              status: "open",
            },
            ...s.reports,
          ],
        }));
        log({
          actorId: reporterId,
          action: "Message reported",
          target: `Message from ${getUser(msg.senderId)?.name}`,
          campusId: conv.campusId,
          category: "safeguarding",
          detail: reason,
        });
      },
      resolveReport: (reportId, action, actorId) => {
        const rep = stateRef.current.reports.find((r) => r.id === reportId);
        if (!rep) return;
        const resolution =
          action === "dismiss" ? "Dismissed – no action needed" : action === "warn" ? "Warning sent to user" : "Mentor badge suspended";
        setState((s) => ({
          ...s,
          reports: s.reports.map((r) =>
            r.id === reportId
              ? { ...r, status: action === "dismiss" ? "dismissed" : "actioned", resolution, resolvedBy: actorId, resolvedAt: now() }
              : r
          ),
        }));
        const subject = getUser(rep.subjectUserId);
        if (action === "suspend") api.setBadgeStatus(rep.subjectUserId, "Mentor", "suspended", actorId);
        if (action === "warn" && subject) {
          pushOutbox({
            channel: subject.role === "STU" ? "push" : "email",
            to: subject.name,
            toUserId: subject.id,
            body: "Reminder from your campus alumni office: please keep all conversations on the platform and don't share phone numbers, emails or social handles.",
          });
        }
        log({ actorId, action: "Report resolved", target: subject?.name ?? "", campusId: rep.campusId, category: "safeguarding", detail: resolution });
      },
      setBadgeStatus: (userId, type, status, actorId) => {
        setState((s) => ({
          ...s,
          users: s.users.map((u) =>
            u.id === userId ? { ...u, badges: (u.badges ?? []).map((b) => (b.type === type ? { ...b, status } : b)) } : u
          ),
        }));
        const u = getUser(userId);
        log({
          actorId,
          action: status === "suspended" ? `${type} badge suspended` : `${type} badge reinstated`,
          target: u?.name ?? userId,
          campusId: u?.campusIds[0],
          category: "safeguarding",
          detail: status === "suspended" ? "Effective immediately – hidden from students, chats read-only" : undefined,
        });
      },
      logView: (actorId, target, campusId) =>
        log({ actorId, action: "Viewed student data", target, campusId, category: "data_access", detail: "Conversation transcript (CS-16)" }),

      /* ---------------- verification ---------------- */
      findMigrated: (q) => {
        const n = q.trim().toLowerCase().replace(/\s/g, "");
        if (!n) return undefined;
        return migratedRecords.find(
          (m) => m.email.toLowerCase() === n || m.mobile.replace(/\s/g, "") === n || m.mobile.replace(/\D/g, "").endsWith(n.replace(/\D/g, "")) && n.replace(/\D/g, "").length >= 10
        );
      },
      submitVerification: (input) => {
        const id = uid("vr");
        const userId = uid("u");
        const at = now();
        const migrated = input.migratedId ? migratedRecords.find((m) => m.id === input.migratedId) : undefined;

        // 1. Claimed a migrated profile that was already verified on the old platform (DM-5)
        let outcome: VerificationResult["outcome"] = "pending";
        let fieldChecks: VerificationRequest["fieldChecks"];
        let closest: VerificationRequest["closestRecord"];
        let note: string | undefined;

        if (migrated?.verified) {
          outcome = "claimed_verified";
          fieldChecks = { name: "match", passYear: "match", admissionNo: "missing", campus: "match" };
          note = "Verification status preserved from the current platform (DM-5).";
        } else {
          // 2. Match against ERP (A2)
          const sameCampus = erpRecords.filter((r) => r.campusId === input.campusId);
          const exact = sameCampus.find(
            (r) => admissionMatch(input.admissionNo, r.admissionNo) === "match" && r.passYear === input.passYear
          );
          const candidate =
            exact ??
            sameCampus
              .map((r) => ({
                r,
                score:
                  (nameMatch(input.name, r.name) === "match" ? 2 : nameMatch(input.name, r.name) === "partial" ? 1 : 0) +
                  (admissionMatch(input.admissionNo, r.admissionNo) !== "mismatch" ? 2 : 0) +
                  (r.passYear === input.passYear ? 1 : 0),
              }))
              .filter((x) => x.score >= 2)
              .sort((a, b) => b.score - a.score)[0]?.r;

          if (candidate) {
            closest = { admissionNo: candidate.admissionNo, name: candidate.name, passYear: candidate.passYear, campusId: candidate.campusId };
            fieldChecks = {
              name: nameMatch(input.name, candidate.name),
              passYear: candidate.passYear === input.passYear ? "match" : "mismatch",
              admissionNo: admissionMatch(input.admissionNo, candidate.admissionNo),
              campus: "match",
            };
            if (fieldChecks.passYear === "match" && fieldChecks.admissionNo === "match" && fieldChecks.name !== "mismatch") {
              outcome = "auto_approved";
            }
          } else {
            fieldChecks = { name: "missing", passYear: "missing", admissionNo: "missing", campus: "match" };
            note =
              input.passYear < ERP_EARLIEST_YEAR
                ? `Batch ${input.passYear} is older than the school records in the ERP (from ${ERP_EARLIEST_YEAR}).`
                : "No matching school record found.";
          }
        }

        const verified = outcome !== "pending";
        const req: VerificationRequest = {
          id,
          userId,
          name: input.name,
          campusId: input.campusId,
          passYear: input.passYear,
          admissionNo: input.admissionNo || "Not known",
          email: input.email,
          submittedAt: at,
          method: migrated ? "claim" : "self_signup",
          closestRecord: closest,
          fieldChecks,
          vouches: [],
          status: verified ? "auto_approved" : "pending",
          decidedBy: verified ? "system" : undefined,
          decidedAt: verified ? at : undefined,
          note,
        };
        const newUser: User = {
          id: userId,
          name: input.name,
          role: verified ? "ALU" : "ALP",
          campusIds: [input.campusId],
          email: input.email,
          mobile: input.mobile,
          batch: input.passYear,
          college: migrated?.college,
          company: migrated?.company,
          title: migrated?.title,
          badges: [],
        };
        setState((s) => ({ ...s, users: [...s.users, newUser], verifications: [req, ...s.verifications] }));
        log({
          actorId: "system",
          action: verified ? (migrated ? "Migrated profile claimed" : "Alumnus auto-verified") : "Verification queued",
          target: input.name,
          campusId: input.campusId,
          category: "verification",
          detail: verified
            ? migrated
              ? "Verified status carried over from current platform"
              : "Pass year + admission no. + name matched ERP"
            : note ?? "Partial match – sent to campus queue",
        });
        pushOutbox({
          channel: "email",
          to: `${input.name} · ${input.email}`,
          body: verified
            ? `Welcome to the VIBGYOR Alumni Association, ${firstName(input.name)}! Your profile is verified.`
            : `Thanks ${firstName(input.name)}. Your campus alumni office will verify your details, usually within 2 working days. You can also ask two batchmates to vouch for you.`,
        });
        // Invite tracking: mark the referrer's invite as joined (C11)
        if (input.ref && getUser(input.ref)) {
          const digits = (x: string) => x.replace(/\D/g, "").slice(-10);
          setState((s) => {
            const hit = s.invites.find(
              (i) => i.by === input.ref && !i.joined && (i.to.toLowerCase() === input.email.toLowerCase() || (digits(i.to).length === 10 && digits(i.to) === digits(input.mobile)))
            );
            return {
              ...s,
              invites: hit
                ? s.invites.map((i) => (i.id === hit.id ? { ...i, joined: true } : i))
                : [{ id: uid("inv"), by: input.ref!, to: input.email, channel: "email" as const, at: now(), joined: true }, ...s.invites],
            };
          });
          log({ actorId: userId, action: "Joined from an invite", target: getUser(input.ref)?.name ?? input.ref, campusId: input.campusId, category: "community" });
        }
        return { outcome, userId, request: req };
      },
      decideVerification: (id, decision, actorId, note) => {
        const req = stateRef.current.verifications.find((v) => v.id === id);
        if (!req) return;
        setState((s) => ({
          ...s,
          verifications: s.verifications.map((v) =>
            v.id === id ? { ...v, status: decision, decidedBy: actorId, decidedAt: now(), note: note ?? v.note } : v
          ),
          users: s.users.map((u) => (u.id === req.userId && decision === "approved" ? { ...u, role: "ALU", badges: u.badges ?? [] } : u)),
        }));
        log({
          actorId,
          action: decision === "approved" ? "Alumnus verified" : decision === "rejected" ? "Verification rejected" : "More information requested",
          target: req.name,
          campusId: req.campusId,
          category: "verification",
          detail: note,
        });
        pushOutbox({
          channel: "whatsapp",
          to: `${req.name}`,
          toUserId: req.userId,
          body:
            decision === "approved"
              ? `Good news ${firstName(req.name)}: your VIBGYOR alumni profile is verified. Welcome back!`
              : decision === "rejected"
                ? `Hi ${firstName(req.name)}, we couldn't verify your alumni profile. Reason: ${note || "details didn't match school records"}.`
                : `Hi ${firstName(req.name)}, your campus alumni office needs a little more information to verify you: ${note || "please upload a school ID or leaving certificate"}. You can reply and attach it from your VIBGYOR alumni home page.`,
        });
      },
      answerInfoRequest: (id, userId, reply, doc) => {
        const req = stateRef.current.verifications.find((v) => v.id === id);
        const text = reply.trim();
        if (!req || req.userId !== userId || req.status !== "info_requested" || (!text && !doc)) return;
        const parts = [text, doc ? `📎 ${doc.kind} attached` : ""].filter(Boolean).join(" · ");
        setState((s) => ({
          ...s,
          verifications: s.verifications.map((v) =>
            v.id === id
              ? { ...v, status: "pending", note: `Alumnus replied: ${parts}`, decidedBy: undefined, decidedAt: undefined, attachments: doc ? [...(v.attachments ?? []), doc] : v.attachments }
              : v
          ),
        }));
        log({ actorId: userId, action: "Replied to verification info request", target: req.name, campusId: req.campusId, category: "verification", detail: parts.slice(0, 120) });
        if (doc)
          log({ actorId: userId, action: "Verification document uploaded", target: req.name, campusId: req.campusId, category: "verification", detail: `${doc.kind} · ${doc.name}` });
      },
      viewVerificationDoc: (reqId, docId, actorId) => {
        const req = stateRef.current.verifications.find((v) => v.id === reqId);
        const doc = req?.attachments?.find((d) => d.id === docId);
        if (!req || !doc) return;
        log({ actorId, action: "Viewed verification document", target: req.name, campusId: req.campusId, category: "data_access", detail: `${doc.kind} · ${doc.name}` });
      },
      vouch: (id, voucherId) => {
        const req = stateRef.current.verifications.find((v) => v.id === id);
        const voucher = getUser(voucherId);
        if (!req || !voucher || req.vouches.some((v) => v.by === voucherId)) return;
        if (voucher.role !== "ALU" || voucher.deactivated || voucher.campusIds[0] !== req.campusId || voucher.batch !== req.passYear || req.status !== "pending") return;
        const vouches = [...req.vouches, { by: voucherId, byName: `${voucher.name} (Batch ${voucher.batch})`, at: now() }];
        const done = vouches.length >= 2;
        setState((s) => ({
          ...s,
          verifications: s.verifications.map((v) =>
            v.id === id ? { ...v, vouches, status: done ? "peer_approved" : v.status, decidedBy: done ? "peer" : v.decidedBy, decidedAt: done ? now() : v.decidedAt } : v
          ),
          users: s.users.map((u) => (u.id === req.userId && done ? { ...u, role: "ALU", badges: [] } : u)),
        }));
        log({
          actorId: voucherId,
          action: done ? "Verified by peer vouch (2 of 2)" : "Peer vouch added",
          target: req.name,
          campusId: req.campusId,
          category: "verification",
        });
        if (done)
          pushOutbox({
            channel: "whatsapp",
            to: req.name,
            toUserId: req.userId,
            body: `Good news ${firstName(req.name)}: two batchmates vouched for you, so your VIBGYOR alumni profile is now verified.`,
          });
      },
      applyBadge: (userId, badge, motivation, listing) => {
        const u = getUser(userId);
        if (!u || u.role !== "ALU" || u.deactivated) return;
        // Chapter Lead is appointed and Donor is automatic: neither can be requested
        if (badge === "ChapterLead" || badge === "Donor") return;
        if (stateRef.current.badgeRequests.some((b) => b.userId === userId && b.badge === badge && b.status === "pending")) return;
        if (listing) setState((s) => ({ ...s, users: s.users.map((x) => (x.id === userId ? { ...x, listing } : x)) }));
        const at = now();
        setState((s) => ({
          ...s,
          badgeRequests: [
            { id: uid("br"), userId, badge, campusId: u?.campusIds[0] ?? "c01", motivation, codeAcceptedAt: at, at, status: "pending" },
            ...s.badgeRequests,
          ],
          users: s.users.map((x) => (x.id === userId ? { ...x, codeOfConductAcceptedAt: at } : x)),
        }));
        log({
          actorId: userId,
          action: `${badge} badge requested`,
          target: u?.name ?? userId,
          campusId: u?.campusIds[0],
          category: "safeguarding",
          detail: "Safeguarding code of conduct accepted (CS-9)",
        });
      },
      decideBadge: (id, approve, actorId) => {
        const br = stateRef.current.badgeRequests.find((b) => b.id === id);
        if (!br) return;
        setState((s) => ({
          ...s,
          badgeRequests: s.badgeRequests.map((b) => (b.id === id ? { ...b, status: approve ? "approved" : "rejected" } : b)),
          users: s.users.map((u) =>
            u.id === br.userId && approve
              ? { ...u, badges: [...(u.badges ?? []).filter((b) => b.type !== br.badge), { type: br.badge, status: "active", since: now() }] }
              : u
          ),
        }));
        log({
          actorId,
          action: approve ? `${br.badge} badge granted` : `${br.badge} badge declined`,
          target: getUser(br.userId)?.name ?? "",
          campusId: br.campusId,
          category: "safeguarding",
        });
      },

      /* ---------------- broadcast ---------------- */
      createBroadcast: (b) => {
        const id = uid("bc");
        const scheduled = !!b.scheduledFor;
        setState((s) => ({
          ...s,
          broadcasts: [{ ...b, id, createdAt: now(), status: scheduled ? "scheduled" : "sending" }, ...s.broadcasts],
        }));
        log({
          actorId: b.createdBy,
          action: scheduled ? "Broadcast scheduled" : "Broadcast sent",
          target: b.title,
          campusId: b.campusIds === "all" ? undefined : b.campusIds[0],
          category: "broadcast",
          detail: `${b.audience} recipients · ${b.channels.join(", ")}`,
        });
        if (!scheduled) {
          setTimeout(() => {
            setState((s) => ({
              ...s,
              broadcasts: s.broadcasts.map((x) => {
                if (x.id !== id) return x;
                const stats: Broadcast["stats"] = {};
                for (const ch of x.channels) {
                  const sent = x.reach[ch] ?? 0;
                  const rate = { email: [0.97, 0.48, 0.17], whatsapp: [0.98, 0.82, 0.36], push: [0.95, 0.22, 0.09], sms: [0.99, 0, 0] }[ch];
                  const delivered = Math.round(sent * rate[0]);
                  stats[ch] = { sent, delivered, opened: Math.round(delivered * rate[1]), clicked: Math.round(delivered * rate[2]) };
                }
                return { ...x, status: "delivered", stats };
              }),
            }));
          }, 2600);
          const me = getUser(b.createdBy);
          if (me) {
            if (b.channels.includes("whatsapp"))
              pushOutbox({ channel: "whatsapp", to: `Sample recipient (preview to ${me.name})`, body: b.body.replace(/{{first_name}}/g, "Karan").slice(0, 400) });
            if (b.channels.includes("email"))
              pushOutbox({ channel: "email", to: `Sample recipient (preview to ${me.name})`, body: `Subject: ${b.subject}\n\n${b.body.replace(/{{first_name}}/g, "Karan").slice(0, 400)}` });
            if (b.channels.includes("push"))
              pushOutbox({ channel: "push", to: "Sample recipient", body: b.subject });
          }
        }
      },
      setMinClass: (campusId, cls, actorId) => {
        setState((s) => ({ ...s, campusMinClass: { ...s.campusMinClass, [campusId]: cls } }));
        log({ actorId, action: "Age gate changed", target: campusId, campusId, category: "admin", detail: `Minimum class set to ${cls} (CS-1)` });
      },


      /* ---------------- Phase 3: administration ---------------- */
      editUser: (userId, fields, actorId) => {
        const u = getUser(userId);
        if ((fields.name !== undefined && check.name(fields.name)) || (fields.email !== undefined && check.email(fields.email)) || (fields.mobile !== undefined && fields.mobile !== "—" && check.mobile(fields.mobile))) return;
        setState((s) => ({ ...s, users: s.users.map((x) => (x.id === userId ? { ...x, ...fields } : x)) }));
        log({ actorId, action: "Alumni record edited", target: u?.name ?? userId, campusId: u?.campusIds[0], category: "admin", detail: Object.keys(fields).join(", ") });
      },
      sendLoginInvites: (userIds, channels, template, actorId) => {
        const at = now();
        const actor = getUser(actorId);
        let sent = 0;
        let skipped = 0;
        const done: string[] = [];
        userIds.forEach((id) => {
          const u = getUser(id);
          if (!u || u.deactivated) {
            skipped++;
            return;
          }
          const body = loginInviteBody(template, u);
          const href = `/login?id=${encodeURIComponent(u.email)}`;
          let any = false;
          channels.forEach((ch) => {
            const hasMobile = /\d{6,}/.test(u.mobile.replace(/\D/g, ""));
            if (ch !== "email" && !hasMobile) return;
            any = true;
            pushOutbox({
              channel: ch,
              to: ch === "email" ? `${u.name} · ${u.email}` : `${u.name} · ${maskMobile(u.mobile)}`,
              toUserId: u.id,
              body: ch === "email" ? `Subject: Your VIBGYOR Alumni login link\n\n${body}` : ch === "sms" ? body.split("\n\n")[0] + ` Sign in: vaa.vibgyor.in/login` : body,
              link: { label: "Open login link", href },
            });
          });
          if (any) {
            sent++;
            done.push(id);
          } else skipped++;
        });
        if (done.length)
          setState((s) => ({
            ...s,
            users: s.users.map((u) => (done.includes(u.id) ? { ...u, loginInviteAt: at, loginInviteCount: (u.loginInviteCount ?? 0) + 1 } : u)),
          }));
        const first = done.length ? getUser(done[0]) : undefined;
        log({
          actorId,
          action: "Login link sent",
          target: done.length === 1 ? first?.name ?? "1 alumnus" : `${done.length} alumni`,
          campusId: actor?.campusIds.length === 1 ? actor.campusIds[0] : undefined,
          category: "broadcast",
          detail: `${channels.join(", ")}${skipped ? ` · ${skipped} skipped` : ""}`,
        });
        return { sent, skipped };
      },
      setDeactivated: (userId, off, actorId) => {
        const u = getUser(userId);
        if (off && userId === actorId) return;
        if (off && u?.role === "SAD" && stateRef.current.users.filter((x) => x.role === "SAD" && !x.deactivated).length <= 1) return;
        setState((s) => ({ ...s, users: s.users.map((x) => (x.id === userId ? { ...x, deactivated: off } : x)) }));
        log({ actorId, action: off ? "Account deactivated" : "Account reactivated", target: u?.name ?? userId, campusId: u?.campusIds[0], category: "admin" });
      },
      logExport: (actorId, target, reason, campusId) =>
        log({ actorId, action: "Exported data", target, campusId, category: "data_access", detail: `Reason: ${reason} (L3)` }),
      addEngagements: (entries, actorId) => {
        setState((s) => ({ ...s, engagements: [...entries.map((e) => ({ ...e, id: uid("en") })), ...s.engagements] }));
        log({
          actorId,
          action: entries.length > 1 ? "Engagement log bulk upload" : "Interaction logged",
          target: entries.length > 1 ? `${entries.length} interactions` : (getUser(entries[0]?.alumniId)?.name ?? ""),
          campusId: entries[0]?.campusId,
          category: "community",
        });
      },
      mergeUsers: (keepId, dropId, chosen, actorId) => {
        const keep = getUser(keepId);
        const drop = getUser(dropId);
        if (!keep || !drop) return;
        const swap = (id: string) => (id === dropId ? keepId : id);
        setState((s) => ({
          ...s,
          users: s.users
            .filter((u) => u.id !== dropId)
            .map((u) => (u.id === keepId ? { ...u, ...chosen, mergedFrom: [...(u.mergedFrom ?? []), dropId] } : u)),
          posts: s.posts.map((p) => ({ ...p, authorId: swap(p.authorId), likes: [...new Set(p.likes.map(swap))] })),
          jobs: s.jobs.map((j) => ({ ...j, postedBy: swap(j.postedBy), interested: j.interested.map((i) => ({ ...i, userId: swap(i.userId) })) })),
          events: s.events.map((e) => ({ ...e, rsvps: e.rsvps.filter((r) => !(r.userId === dropId && e.rsvps.some((x) => x.userId === keepId))).map((r) => ({ ...r, userId: swap(r.userId) })) })),
          dmThreads: s.dmThreads.map((t) => ({ ...t, members: t.members.map(swap) as [string, string] })),
          dms: s.dms.map((m) => ({ ...m, senderId: swap(m.senderId) })),
          invites: s.invites.map((i) => ({ ...i, by: swap(i.by) })),
          engagements: s.engagements.map((e) => ({ ...e, alumniId: swap(e.alumniId) })),
        }));
        log({ actorId, action: "Duplicate records merged", target: `${drop.name} → ${keep.name}`, campusId: keep.campusIds[0], category: "admin", detail: `Kept ${keep.email}; history moved across (L4)` });
      },
      addMasterItem: (kind, name, actorId) => {
        setState((s) => ({ ...s, masters: { ...s.masters, [kind]: [...s.masters[kind], { id: uid(kind[0]), name, aliases: [] }].sort((a, b) => a.name.localeCompare(b.name)) } }));
        log({ actorId, action: "Master list item added", target: `${kind}: ${name}`, category: "admin" });
      },
      mapValue: (kind, raw, itemId, actorId) => {
        const item = stateRef.current.masters[kind].find((m) => m.id === itemId);
        if (!item) return;
        const key = masterUserKey[kind];
        const affected = stateRef.current.users.filter((u) => u[key] === raw).length;
        setState((s) => ({
          ...s,
          masters: { ...s.masters, [kind]: s.masters[kind].map((m) => (m.id === itemId ? { ...m, aliases: [...new Set([...m.aliases, raw])] } : m)) },
          users: s.users.map((u) => (u[key] === raw ? { ...u, [key]: item.name } : u)),
        }));
        log({ actorId, action: "Value standardised", target: `"${raw}" → "${item.name}"`, category: "admin", detail: `${affected} record${affected === 1 ? "" : "s"} updated (L5)` });
      },
      removeAlias: (kind, itemId, alias) => {
        setState((s) => ({ ...s, masters: { ...s.masters, [kind]: s.masters[kind].map((m) => (m.id === itemId ? { ...m, aliases: m.aliases.filter((a) => a !== alias) } : m)) } }));
      },
      reportContent: (kind, targetId, reporterId, reason) => {
        const st = stateRef.current;
        const subjectUserId = kind === "post" ? st.posts.find((p) => p.id === targetId)?.authorId : kind === "job" ? st.jobs.find((j) => j.id === targetId)?.postedBy : targetId;
        const subject = subjectUserId ? getUser(subjectUserId) : undefined;
        if (!subject) return;
        const campusId = kind === "job" ? (st.jobs.find((j) => j.id === targetId)?.campusId ?? subject.campusIds[0]) : subject.campusIds[0];
        setState((s) => ({
          ...s,
          reports: [
            { id: uid("rep"), kind, postId: kind === "post" ? targetId : undefined, jobId: kind === "job" ? targetId : undefined, subjectUserId: subject.id, reporterId, reason, campusId, at: now(), status: "open" },
            ...s.reports,
          ],
        }));
        log({ actorId: reporterId, action: `${kind[0].toUpperCase()}${kind.slice(1)} reported`, target: subject.name, campusId, category: "safeguarding", detail: reason });
      },
      resolveModeration: (reportId, action, actorId) => {
        const rep = stateRef.current.reports.find((r) => r.id === reportId);
        if (!rep) return;
        const resolution =
          action === "dismiss" ? "Dismissed – no action needed" : action === "warn" ? "Warning sent to user" : rep.kind === "post" ? "Post removed" : rep.kind === "job" ? "Job taken down" : "Account deactivated pending review";
        setState((s) => ({
          ...s,
          reports: s.reports.map((r) => (r.id === reportId ? { ...r, status: action === "dismiss" ? "dismissed" : "actioned", resolution, resolvedBy: actorId, resolvedAt: now() } : r)),
          posts: action === "remove" && rep.postId ? s.posts.filter((p) => p.id !== rep.postId) : s.posts,
          jobs: action === "remove" && rep.jobId ? s.jobs.map((j) => (j.id === rep.jobId ? { ...j, status: "closed" } : j)) : s.jobs,
          users: action === "remove" && rep.kind === "profile" ? s.users.map((u) => (u.id === rep.subjectUserId ? { ...u, deactivated: true } : u)) : s.users,
        }));
        const subject = getUser(rep.subjectUserId);
        if (subject && action !== "dismiss")
          pushOutbox({
            channel: "email",
            to: `${subject.name} · ${subject.email}`,
            toUserId: subject.id,
            body: `Subject: About your ${rep.kind} on VAA\n\n${action === "warn" ? "Your campus alumni office reviewed a report and is reminding you of the community guidelines." : `${resolution}. You can reply to this email to appeal.`}`,
          });
        log({ actorId, action: "Report resolved", target: subject?.name ?? "", campusId: rep.campusId, category: "safeguarding", detail: resolution });
      },
      submitDataRequest: (type, subjectId, requesterId, details) => {
        const subject = getUser(subjectId);
        const at = now();
        setState((s) => ({
          ...s,
          dataRequests: [
            { id: uid("dr"), type, subjectId, requesterId, campusId: subject?.campusIds[0] ?? "c01", details, at, due: new Date(Date.now() + REQUEST_DAYS * 86400_000).toISOString(), status: "open" },
            ...s.dataRequests,
          ],
        }));
        const req = getUser(requesterId);
        if (req)
          pushOutbox({
            channel: "email",
            to: `${req.name} · ${req.email}`,
            toUserId: req.id,
            body: `Subject: We've received your ${type === "complaint" ? "privacy complaint" : `data ${type} request`}\n\nReference ${uid("REQ").toUpperCase().slice(4)}. We'll respond within ${REQUEST_DAYS} days. Grievance officer: [TBC – VIBGYOR to name].`,
          });
        log({ actorId: requesterId, action: "Data request submitted", target: `${type} · ${subject?.name}`, campusId: subject?.campusIds[0], category: "consent" });
      },
      updateDataRequest: (id, status, actorId, resolution) => {
        const r = stateRef.current.dataRequests.find((x) => x.id === id);
        if (!r) return;
        const anonymise = status === "done" && r.type === "deletion";
        setState((s) => ({
          ...s,
          dataRequests: s.dataRequests.map((x) => (x.id === id ? { ...x, status, resolution: resolution ?? x.resolution, resolvedBy: status === "done" || status === "rejected" ? actorId : x.resolvedBy, resolvedAt: status === "done" || status === "rejected" ? now() : x.resolvedAt } : x)),
          users: anonymise
            ? s.users.map((u) =>
                u.id === r.subjectId
                  ? { ...u, name: "Deleted member", email: `deleted-${u.id}@invalid`, mobile: "—", company: undefined, title: undefined, city: undefined, college: undefined, bio: undefined, profile: u.profile ? { ...u.profile, headline: undefined, work: [], education: [], achievements: [], skills: [], linkedin: undefined, resumeName: undefined } : undefined, deactivated: true }
                  : u
              )
            : s.users,
        }));
        const req = getUser(r.requesterId);
        if (req && (status === "done" || status === "rejected"))
          pushOutbox({ channel: "email", to: `${req.name} · ${req.email}`, toUserId: req.id, body: `Subject: Update on your ${r.type} request\n\n${status === "done" ? "Completed" : "We couldn't complete it"}. ${resolution ?? ""}` });
        log({ actorId, action: `Data request ${status.replace("_", " ")}`, target: `${r.type} · ${getUser(r.subjectId)?.name ?? "member"}`, campusId: r.campusId, category: "consent", detail: anonymise ? "Personal data anonymised (A11)" : resolution });
      },
      setPermission: (cap, role, on, actorId) => {
        if (on && HARD_LIMITS[cap] && !HARD_LIMITS[cap]!.includes(role)) return; // §7 guard rail: cannot be loosened
        setState((s) => ({ ...s, permissions: { ...s.permissions, [cap]: on ? [...new Set([...s.permissions[cap], role])] : s.permissions[cap].filter((r) => r !== role) } }));
        log({ actorId, action: "Permission changed", target: `${role} · ${cap}`, category: "admin", detail: on ? "granted" : "removed" });
      },

      /* ---------------- Phase 2: community ---------------- */
      updateProfile: (userId, profile, fields) => {
        setState((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === userId ? { ...u, ...fields, profile: u.profile || Object.keys(profile).length ? { ...u.profile!, ...profile } : u.profile } : u)),
        }));
      },
      postJob: (j) => {
        const u = getUser(j.postedBy);
        if (!u || (u.role === "ALU" && !activeBadge(u, "Recruiter")) || !["ALU", "CAD", "GAO", "SAD"].includes(u.role)) return; // cond. 9
        const masked = maskContacts(j.description).text; // CS-6: replies go through VAA, not personal numbers
        setState((s) => ({ ...s, jobs: [{ ...j, description: masked, id: uid("job"), at: now(), status: "pending", interested: [] }, ...s.jobs] }));
        log({ actorId: j.postedBy, action: "Job posted for approval", target: `${j.title} · ${j.company}`, campusId: j.campusId, category: "community", detail: j.forStudents ? "Requested for students too" : undefined });
        pushOutbox({ channel: "email", to: `${u?.name} · ${u?.email}`, toUserId: u?.id, body: `Subject: We've received your job post\n\n"${j.title}" will appear on the VAA jobs board once your campus alumni office approves it (usually within 2 working days).` });
      },
      decideJob: (id, approve, actorId) => {
        const j = stateRef.current.jobs.find((x) => x.id === id);
        if (!j) return;
        const poster = getUser(j.postedBy);
        setState((s) => ({ ...s, jobs: s.jobs.map((x) => (x.id === id ? { ...x, status: approve ? "approved" : "rejected", decidedBy: actorId } : x)) }));
        log({ actorId, action: approve ? "Job approved" : "Job rejected", target: `${j.title} · ${j.company}`, campusId: j.campusId, category: "community" });
        if (poster)
          pushOutbox({
            channel: "email",
            to: `${poster.name} · ${poster.email}`,
            toUserId: poster.id,
            body: approve ? `Subject: Your job is live\n\n"${j.title}" is now on the VAA jobs board.` : `Subject: Your job post needs changes\n\n"${j.title}" wasn't approved. Common reasons: personal contact details in the description, or missing company details. Please edit and resubmit.`,
          });
      },
      closeJob: (id, actorId) => {
        setState((s) => ({ ...s, jobs: s.jobs.map((x) => (x.id === id ? { ...x, status: "closed" } : x)) }));
        const j = stateRef.current.jobs.find((x) => x.id === id);
        log({ actorId, action: "Job closed", target: j?.title ?? id, campusId: j?.campusId, category: "community" });
      },
      setInterestStatus: (jobId, studentId, status, note, actorId) => {
        const j = stateRef.current.jobs.find((x) => x.id === jobId);
        const stu = getUser(studentId);
        const actor = getUser(actorId);
        if (!j || !stu || !actor || stu.role !== "STU") return;
        if (actor.role === "TCH" && !actor.campusIds.includes(stu.campusIds[0])) return;
        setState((s) => ({
          ...s,
          jobs: s.jobs.map((x) =>
            x.id === jobId
              ? { ...x, interested: x.interested.map((i) => (i.userId === studentId ? { ...i, counsellor: { status, note: note.trim() || undefined, by: actorId, at: now() } } : i)) }
              : x
          ),
        }));
        const label: Record<InterestStatus, string> = { new: "New", checking: "Checking with your parent", passed_on: "Passed on to the company", declined: "Not taken forward" };
        pushOutbox({
          channel: "push",
          to: stu.name,
          toUserId: stu.id,
          body: `Your counsellor updated "${j.title}": ${label[status]}${note.trim() ? ` · ${note.trim()}` : ""}`,
          link: { label: "Open internships", href: "/portal/jobs" },
        });
        if (status === "passed_on" || status === "declined")
          (stu.parentIds ?? []).map((id) => getUser(id)).forEach((p) => {
            if (!p) return;
            pushOutbox({
              channel: "whatsapp",
              to: `${p.name} · ${maskMobile(p.mobile)}`,
              toUserId: p.id,
              body: `${childTag(stu)} ${firstName(stu.name)}'s interest in "${j.title}" at ${j.company}: ${label[status].toLowerCase()}.${note.trim() ? ` Counsellor's note: ${note.trim()}` : ""}`,
            });
          });
        log({ actorId, action: "Student interest updated", target: `${stu.name} · ${j.title}`, campusId: stu.campusIds[0], category: "community", detail: label[status] });
      },
      saveStaff: (input, actorId) => {
        const actor = getUser(actorId);
        const STAFF: Role[] = ["TCH", "CAD", "GAO", "FIN", "MCZ", "SAD"];
        if (!STAFF.includes(input.role)) return { ok: false, error: "Pick a staff role." };
        // Annex B: CAD creates teachers (own campus), GAO creates campus staff, SAD creates everyone
        const may = manageableRoles(actor?.role);
        const target = input.id ? getUser(input.id) : undefined;
        if (!may.includes(input.role) || (target && !may.includes(target.role))) return { ok: false, error: "Your role can't manage that kind of staff account." };
        if (actor?.role === "CAD" && (input.campusIds.length !== 1 || !actor.campusIds.includes(input.campusIds[0]) || (target && !actor.campusIds.includes(target.campusIds[0]))))
          return { ok: false, error: "Campus Admins manage teachers at their own campus only." };
        const fmt = check.name(input.name) || check.email(input.email) || check.mobile(input.mobile);
        if (fmt) return { ok: false, error: fmt };
        const all = campusIdsAll();
        const campusIds = input.role === "GAO" || input.role === "SAD" ? all : input.campusIds;
        if ((input.role === "TCH" || input.role === "CAD") && campusIds.length !== 1) return { ok: false, error: "Teachers and Campus Admins have exactly one campus." };
        if ((input.role === "FIN" || input.role === "MCZ") && campusIds.length < 1) return { ok: false, error: "Assign at least one campus." };
        const st = stateRef.current;
        const clash = st.users.find((u) => u.email.toLowerCase() === input.email.trim().toLowerCase() && u.id !== input.id);
        if (clash) return { ok: false, error: `${clash.name} already uses that email.` };
        const before = input.id ? getUser(input.id) : undefined;
        if (before && before.role === "SAD" && input.role !== "SAD" && st.users.filter((u) => u.role === "SAD" && !u.deactivated).length <= 1)
          return { ok: false, error: "There must always be at least one Super Admin." };
        if (before && before.id === actorId && input.role !== "SAD") return { ok: false, error: "You can't change your own role." };
        if (before) {
          setState((s) => ({ ...s, users: s.users.map((u) => (u.id === before.id ? { ...u, name: input.name.trim(), email: input.email.trim(), mobile: input.mobile.trim(), role: input.role, campusIds } : u)) }));
          log({
            actorId,
            action: "Staff access changed",
            target: before.name,
            category: "admin",
            detail: `${before.role} → ${input.role} · ${campusIds.length === all.length ? "all campuses" : campusIds.map((c) => campusNameFor(c)).join(", ")}`,
          });
        } else {
          const id = uid("staff");
          setState((s) => ({ ...s, users: [...s.users, { id, name: input.name.trim(), email: input.email.trim(), mobile: input.mobile.trim() || "—", role: input.role, campusIds }] }));
          pushOutbox({
            channel: "email",
            to: `${input.name.trim()} · ${input.email.trim()}`,
            body: `Subject: Your VIBGYOR Alumni Platform staff account\n\nHi ${firstName(input.name)}, you've been added as ${input.role}. Sign in at vaa.vibgyor.in/login with ${input.email.trim()}: we'll send a one-time code, then you'll set up 2-factor sign-in. No password is needed.`,
            link: { label: "Open login link", href: `/login?id=${encodeURIComponent(input.email.trim())}` },
          });
          log({ actorId, action: "Staff account created", target: input.name.trim(), category: "admin", detail: `${input.role} · ${campusIds.length === all.length ? "all campuses" : campusIds.map((c) => campusNameFor(c)).join(", ")}` });
        }
        return { ok: true };
      },
      resetTwoFactor: (userId, actorId) => {
        const u = getUser(userId);
        const a = getUser(actorId);
        if (!u || !a || !manageableRoles(a.role).includes(u.role) || (a.role === "CAD" && !a.campusIds.includes(u.campusIds[0]))) return;
        pushOutbox({ channel: "email", to: `${u.name} · ${u.email}`, toUserId: u.id, body: "Subject: 2-factor sign-in reset\n\nYour 2-factor sign-in was reset by the Super Admin. You'll be asked to set it up again next time you sign in. If you didn't ask for this, contact the alumni office." });
        log({ actorId, action: "2-factor reset", target: u.name, category: "admin" });
      },
      /* ---------------- Annex B: badges ---------------- */
      appointChapterLead: (userId, groupId, actorId) => {
        const u = getUser(userId);
        const actor = getUser(actorId);
        if (!u || !actor || u.role !== "ALU" || u.deactivated) return { ok: false, error: "Only verified alumni can lead a group." };
        if (actor.role === "CAD" && !actor.campusIds.includes(u.campusIds[0])) return { ok: false, error: "That alumnus is not at your campus." };
        if (!["CAD", "GAO", "SAD"].includes(actor.role)) return { ok: false, error: "Only the Campus Admin or Group Alumni Office can appoint." };
        const [, campusId, batch] = groupId.split(":");
        if (campusId !== u.campusIds[0] || (groupId.startsWith("batch:") && Number(batch) !== u.batch)) return { ok: false, error: "They can only lead their own batch or campus group." };
        setState((s) => ({
          ...s,
          users: s.users.map((x) =>
            x.id === userId ? { ...x, badges: [...(x.badges ?? []).filter((b) => b.type !== "ChapterLead"), { type: "ChapterLead", status: "active", since: now(), group: groupId, by: actorId }] } : x
          ),
        }));
        pushOutbox({ channel: "email", to: `${u.name} · ${u.email}`, toUserId: u.id, body: `Subject: You're now a Chapter Lead\n\nHi ${firstName(u.name)}, you've been appointed Chapter Lead for your group. You can post announcements, create group events and remove posts that break the community rules.`, link: { label: "Open batch groups", href: "/portal/groups" } });
        log({ actorId, action: "Chapter Lead appointed", target: u.name, campusId: u.campusIds[0], category: "admin", detail: groupId });
        return { ok: true };
      },
      revokeBadge: (userId, type, actorId) => {
        const u = getUser(userId);
        if (!u) return;
        setState((s) => ({ ...s, users: s.users.map((x) => (x.id === userId ? { ...x, badges: (x.badges ?? []).filter((b) => b.type !== type) } : x)) }));
        log({ actorId, action: `${type} badge removed`, target: u.name, campusId: u.campusIds[0], category: "admin", detail: "Reversible: can be re-granted" });
      },
      setChapterLimit: (n, actorId) => {
        if (!["GAO", "SAD"].includes(getUser(actorId)?.role ?? "")) return;
        setState((s) => ({ ...s, chapterMonthlyLimit: Math.max(0, Math.min(30, Math.round(n))) }));
        log({ actorId, action: "Chapter Lead announcement limit changed", target: `${n} per month`, category: "admin" });
      },
      announce: (groupId, authorId, text) => {
        const u = getUser(authorId);
        const cl = u?.badges?.find((b) => b.type === "ChapterLead");
        if (!u || !cl || cl.status !== "active" || cl.group !== groupId) return { ok: false, error: "Only this group's Chapter Lead can post announcements." };
        const month = new Date().toISOString().slice(0, 7);
        const used = stateRef.current.posts.filter((p) => p.groupId === groupId && p.announcement && p.at.slice(0, 7) === month).length;
        if (used >= stateRef.current.chapterMonthlyLimit) return { ok: false, error: `Monthly limit reached (${stateRef.current.chapterMonthlyLimit}). It resets on the 1st.` };
        setState((s) => ({ ...s, posts: [{ id: uid("gp"), groupId, authorId, text, at: now(), likes: [], announcement: true }, ...s.posts] }));
        log({ actorId: authorId, action: "Group announcement", target: groupId, campusId: u.campusIds[0], category: "community", detail: `${used + 1} of ${stateRef.current.chapterMonthlyLimit} this month` });
        return { ok: true };
      },
      removePost: (postId, actorId) => {
        const p = stateRef.current.posts.find((x) => x.id === postId);
        const a = getUser(actorId);
        if (!p || !a) return;
        const cl = a.badges?.find((b) => b.type === "ChapterLead" && b.status === "active");
        const staff = ["CAD", "GAO", "SAD"].includes(a.role);
        if (!staff && cl?.group !== p.groupId) return;
        setState((s) => ({ ...s, posts: s.posts.filter((x) => x.id !== postId) }));
        log({ actorId, action: "Post removed", target: getUser(p.authorId)?.name ?? "", campusId: p.groupId.split(":")[1], category: "community", detail: staff ? "By staff" : "By Chapter Lead" });
      },
      sendEnquiry: (providerId, fromId, text) => {
        const pr = getUser(providerId);
        const from = getUser(fromId);
        if (!pr || !from || !activeBadge(pr, "ServiceProvider") || from.role !== "ALU") return;
        const masked = maskContacts(text).text;
        pushOutbox({ channel: "email", to: `${pr.name} · ${pr.email}`, toUserId: pr.id, body: `Subject: Business Directory enquiry\n\n${from.name} (Batch ${from.batch}) writes: ${masked}\n\nReply from your VAA Chats.`, link: { label: "Open chats", href: "/portal/chats" } });
        log({ actorId: fromId, action: "Business enquiry sent", target: pr.listing?.business ?? pr.name, campusId: pr.campusIds[0], category: "community" });
      },
      setUserFlags: (userId, flags) => {
        setState((s) => ({ ...s, users: s.users.map((u) => (u.id === userId ? { ...u, ...flags } : u)) }));
        if (flags.mczGuide !== undefined) log({ actorId: userId, action: flags.mczGuide ? "Opted in as MyCareerZ guide" : "Opted out as MyCareerZ guide", target: getUser(userId)?.name ?? "", category: "consent" });
      },
      switchContext: (toUserId) => {
        const cur = stateRef.current.currentUserId ? getUser(stateRef.current.currentUserId) : undefined;
        if (!cur || cur.linkedUserId !== toUserId) return;
        setState((s) => ({ ...s, currentUserId: toUserId }));
        log({ actorId: cur.id, action: "Switched role context", target: `${cur.role} → ${getUser(toUserId)?.role}`, category: "auth" });
      },

      /* ---------------- Annex B: commerce and documents ---------------- */
      donate: (userId, amount, fund, wall) => {
        const u = getUser(userId);
        if (!u || !["ALU", "ALP"].includes(u.role)) return { ok: false, error: u?.role === "PAR" ? "Parents can buy services but can't donate (cond. 15)." : "Only alumni can donate." };
        if (!(amount >= 100)) return { ok: false, error: "Minimum donation is ₹100." };
        const id = uid("pay");
        const ref = `RZP-${80000 + Math.floor(Math.random() * 19999)}`;
        const at = now();
        setState((s) => ({
          ...s,
          payments: [{ id, kind: "donation", payerId: userId, campusId: u.campusIds[0], amount, at, ref, status: "paid", reconciled: false, fund }, ...s.payments],
          users: s.users.map((x) =>
            x.id === userId
              ? { ...x, donorWall: wall, badges: activeBadge(x, "Donor") ? x.badges : [...(x.badges ?? []).filter((b) => b.type !== "Donor"), { type: "Donor", status: "active", since: at }] }
              : x
          ),
        }));
        pushOutbox({ channel: "email", to: `${u.name} · ${u.email}`, toUserId: u.id, body: `Subject: Thank you – receipt ${ref}\n\nWe received ₹${amount.toLocaleString("en-IN")} for the ${fund}. Your 80G receipt is attached. You can see all your gifts under Give → Giving history.` });
        log({ actorId: userId, action: "Donation received", target: `₹${amount.toLocaleString("en-IN")} · ${fund}`, campusId: u.campusIds[0], category: "admin", detail: ref });
        return { ok: true };
      },
      requestDocument: (userId, doc, copies, delivery) => {
        const u = getUser(userId);
        if (!u || !["ALU", "ALP"].includes(u.role) || copies < 1 || copies > 5) return undefined;
        const id = uid("doc");
        const fee = DOC_FEES[doc] * copies + (delivery === "Courier" ? COURIER_FEE : 0);
        setState((s) => ({ ...s, docRequests: [{ id, userId, campusId: u.campusIds[0], doc, copies, fee, delivery, at: now(), status: "awaiting_payment" }, ...s.docRequests] }));
        log({ actorId: userId, action: "Document requested", target: `${doc} × ${copies}`, campusId: u.campusIds[0], category: "admin" });
        return id;
      },
      payDocument: (reqId, userId) => {
        const r = stateRef.current.docRequests.find((x) => x.id === reqId);
        if (!r || r.userId !== userId || r.status !== "awaiting_payment") return;
        const id = uid("pay");
        const ref = `RZP-${80000 + Math.floor(Math.random() * 19999)}`;
        setState((s) => ({
          ...s,
          payments: [{ id, kind: "doc_fee", payerId: userId, campusId: r.campusId, amount: r.fee, at: now(), ref, status: "paid", reconciled: false, docRequestId: reqId }, ...s.payments],
          docRequests: s.docRequests.map((x) => (x.id === reqId ? { ...x, status: "paid", paymentId: id } : x)),
        }));
        log({ actorId: userId, action: "Document fee paid", target: `${r.doc} · ₹${r.fee}`, campusId: r.campusId, category: "admin", detail: ref });
      },
      advanceDocument: (reqId, status, actorId, note) => {
        const r = stateRef.current.docRequests.find((x) => x.id === reqId);
        const a = getUser(actorId);
        if (!r || !a || !["CAD", "GAO", "SAD"].includes(a.role) || (a.role === "CAD" && !a.campusIds.includes(r.campusId))) return;
        if (r.status === "awaiting_payment") return; // fee first (cond. 14)
        setState((s) => ({ ...s, docRequests: s.docRequests.map((x) => (x.id === reqId ? { ...x, status, handledBy: actorId, note: note ?? x.note } : x)) }));
        const u = getUser(r.userId);
        const msg: Record<string, string> = { processing: "is being prepared", ready: r.delivery === "Collect at campus" ? "is ready to collect from the campus office" : "is ready", dispatched: r.delivery === "Courier" ? "has been sent by courier" : "has been emailed to you" };
        if (u && msg[status]) pushOutbox({ channel: "email", to: `${u.name} · ${u.email}`, toUserId: u.id, body: `Subject: Your ${r.doc}\n\nYour ${r.doc} ${msg[status]}.${note ? ` ${note}` : ""}` });
        log({ actorId, action: "Document request updated", target: `${u?.name} · ${r.doc}`, campusId: r.campusId, category: "admin", detail: status });
      },
      refundPayment: (paymentId, reason, actorId) => {
        const p = stateRef.current.payments.find((x) => x.id === paymentId);
        const a = getUser(actorId);
        if (!p || !a) return { ok: false, error: "Not found." };
        if (!can(stateRef.current, a, "finance.refund") || (a.role === "FIN" && !a.campusIds.includes(p.campusId))) return { ok: false, error: "Only Finance (for their campuses) or the Super Admin can refund." };
        if (p.status === "refunded") return { ok: false, error: "Already refunded." };
        if (reason.trim().length < 5) return { ok: false, error: "Give a reason." };
        setState((s) => ({
          ...s,
          payments: s.payments.map((x) => (x.id === paymentId ? { ...x, status: "refunded", reconciled: false, refund: { by: actorId, at: now(), reason: reason.trim() } } : x)),
          docRequests: p.docRequestId ? s.docRequests.map((d) => (d.id === p.docRequestId ? { ...d, status: "awaiting_payment", paymentId: undefined } : d)) : s.docRequests,
          bookings: p.bookingId ? s.bookings.map((b) => (b.id === p.bookingId ? { ...b, status: "cancelled" } : b)) : s.bookings,
        }));
        const payer = getUser(p.payerId);
        if (payer) pushOutbox({ channel: "email", to: `${payer.name} · ${payer.email}`, toUserId: payer.id, body: `Subject: Refund of ₹${p.amount.toLocaleString("en-IN")}\n\nWe've refunded ${p.ref}. It reaches your account in 5–7 working days. Reason: ${reason.trim()}` });
        log({ actorId, action: "Payment refunded", target: `${p.ref} · ₹${p.amount}`, campusId: p.campusId, category: "admin", detail: reason.trim() });
        return { ok: true };
      },
      reconcilePayments: (ids, actorId) => {
        const a = getUser(actorId);
        if (!a || !can(stateRef.current, a, "finance.refund")) return;
        const okIds = new Set(stateRef.current.payments.filter((p) => ids.includes(p.id) && (a.role !== "FIN" || a.campusIds.includes(p.campusId))).map((p) => p.id));
        setState((s) => ({ ...s, payments: s.payments.map((p) => (okIds.has(p.id) ? { ...p, reconciled: true } : p)) }));
        log({ actorId, action: "Payments reconciled", target: `${okIds.size} payment${okIds.size === 1 ? "" : "s"}`, category: "admin" });
      },

      /* ---------------- Annex B: MyCareerZ ---------------- */
      bookMcz: ({ studentId, bookedBy, topic, slot }) => {
        const st = stateRef.current;
        const stu = getUser(studentId);
        const by = getUser(bookedBy);
        if (!stu || !by) return { ok: false, error: "Not found." };
        if (!hasConsent(st, studentId, "mcz")) return { ok: false, error: "A parent must switch on MyCareerZ sharing first (cond. 17)." };
        const isParent = by.role === "PAR" && (stu.parentIds ?? []).includes(by.id);
        if (!(isParent || by.id === studentId)) return { ok: false, error: "Only the student or their parent can book." };
        if (!topic.trim() || !slot) return { ok: false, error: "Pick a topic and a time." };
        const id = uid("bk");
        const payId = isParent ? uid("pay") : undefined;
        const ref = `RZP-${80000 + Math.floor(Math.random() * 19999)}`;
        setState((s) => ({
          ...s,
          bookings: [{ id, studentId, bookedBy, campusId: stu.campusIds[0], topic: topic.trim(), slot, status: "requested", paymentId: payId, at: now() }, ...s.bookings],
          payments: payId ? [{ id: payId, kind: "mcz_session", payerId: bookedBy, forUserId: studentId, campusId: stu.campusIds[0], amount: MCZ_SESSION_FEE, at: now(), ref, status: "paid", reconciled: false, bookingId: id }, ...s.payments] : s.payments,
        }));
        st.users
          .filter((u) => u.role === "MCZ" && !u.deactivated && u.campusIds.includes(stu.campusIds[0]))
          .forEach((m) => pushOutbox({ channel: "email", to: `${m.name} · ${m.email}`, toUserId: m.id, body: `Subject: New session request\n\n${firstName(stu.name)} (Class ${stu.className}, ${campusNameFor(stu.campusIds[0])}) asked for a session on "${topic.trim()}".`, link: { label: "Open MyCareerZ", href: "/portal/mcz" } }));
        log({ actorId: bookedBy, action: isParent ? "MyCareerZ session booked and paid" : "MyCareerZ session requested", target: stu.name, campusId: stu.campusIds[0], category: "consent", detail: isParent ? `₹${MCZ_SESSION_FEE} · ${ref}` : undefined });
        return { ok: true };
      },
      referToMcz: (studentId, teacherId, topic, note) => {
        const stu = getUser(studentId);
        const t = getUser(teacherId);
        if (!stu || !t || t.role !== "TCH" || !t.campusIds.includes(stu.campusIds[0])) return { ok: false, error: "You can only refer students at your campus." };
        if (!hasConsent(stateRef.current, studentId, "mcz")) return { ok: false, error: "The parent hasn't switched on MyCareerZ sharing. Ask them first." };
        if (stateRef.current.bookings.some((b) => b.studentId === studentId && ["referred", "requested", "confirmed"].includes(b.status))) return { ok: false, error: "This student already has an open MyCareerZ referral or booking." };
        setState((s) => ({ ...s, bookings: [{ id: uid("bk"), studentId, bookedBy: teacherId, campusId: stu.campusIds[0], topic: topic.trim() || "Career guidance", slot: "", status: "referred", note: note.trim() || undefined, at: now() }, ...s.bookings] }));
        log({ actorId: teacherId, action: "Referred to MyCareerZ", target: stu.name, campusId: stu.campusIds[0], category: "consent" });
        return { ok: true };
      },
      updateBooking: (id, status, actorId, slot) => {
        const b = stateRef.current.bookings.find((x) => x.id === id);
        const a = getUser(actorId);
        if (!b || !a || a.role !== "MCZ" || !a.campusIds.includes(b.campusId)) return;
        setState((s) => ({ ...s, bookings: s.bookings.map((x) => (x.id === id ? { ...x, status, counsellorId: actorId, slot: slot ?? x.slot } : x)) }));
        const stu = getUser(b.studentId);
        if (stu && status === "confirmed")
          (stu.parentIds ?? []).map((pid) => getUser(pid)).forEach((p) => {
            if (p) pushOutbox({ channel: "whatsapp", to: `${p.name} · ${maskMobile(p.mobile)}`, toUserId: p.id, body: `${childTag(stu)} MyCareerZ session on "${b.topic}" confirmed for ${new Date(slot ?? b.slot).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}.` });
          });
        log({ actorId, action: "MyCareerZ booking updated", target: stu?.name ?? "", campusId: b.campusId, category: "consent", detail: status });
      },
      markInterest: (jobId, userId, note) => {
        const j = stateRef.current.jobs.find((x) => x.id === jobId);
        const u = getUser(userId);
        if (!j || !u) return;
        setState((s) => ({ ...s, jobs: s.jobs.map((x) => (x.id === jobId ? { ...x, interested: [...x.interested.filter((i) => i.userId !== userId), { userId, at: now(), note }] } : x)) }));
        if (u.role === "STU") {
          // students never contact the employer directly: it goes to the campus career counsellor (CS-4)
          stateRef.current.users
            .filter((x) => x.role === "TCH" && !x.deactivated && x.campusIds.includes(u.campusIds[0]))
            .forEach((tch) =>
              pushOutbox({
                channel: "email",
                to: `${tch.name} · ${tch.email}`,
                toUserId: tch.id,
                body: `Subject: Student interest – ${j.title}\n\n${u.name} (Class ${u.className}) is interested in "${j.title}" at ${j.company}. Please check with the parent before passing the application on.`,
                link: { label: "Open student interest", href: "/portal/teacher/interest" },
              })
            );
          log({ actorId: userId, action: "Student interest sent to career counsellor", target: `${j.title} · ${j.company}`, campusId: u.campusIds[0], category: "community" });
        } else {
          const poster = getUser(j.postedBy);
          if (poster)
            pushOutbox({ channel: "email", to: `${poster.name} · ${poster.email}`, toUserId: poster.id, body: `Subject: ${u.name} is interested in ${j.title}\n\n${u.name} (Batch ${u.batch}, ${u.title ?? ""}${u.company ? " at " + u.company : ""}) marked interest.${note ? `\n\n"${note}"` : ""}\n\nReply from your VAA chats.` });
        }
      },
      createEvent: (e) => {
        const by = getUser(e.createdBy);
        if (!by) return;
        if (by.role === "ALU") {
          const cl = by.badges?.find((b) => b.type === "ChapterLead" && b.status === "active");
          if (!cl || !e.groupId || cl.group !== e.groupId) return; // cond. 11
        } else if (by.role === "MCZ") {
          if (e.campusIds === "all" || e.campusIds.some((c) => !by.campusIds.includes(c)) || e.kind !== "Webinar") return; // cond. 12
        } else if (!["CAD", "GAO", "SAD"].includes(by.role)) return;
        setState((s) => ({ ...s, events: [{ ...e, id: uid("ev"), createdAt: now(), rsvps: [] }, ...s.events] }));
        log({ actorId: e.createdBy, action: "Event created", target: e.title, campusId: e.campusIds === "all" ? undefined : e.campusIds[0], category: "community", detail: `${e.kind} · for ${e.audience.join(", ")}` });
      },
      joinEvent: (eventId, userId) => {
        const ev = stateRef.current.events.find((x) => x.id === eventId);
        const u = getUser(userId);
        if (!ev || !u) return;
        setState((s) => ({
          ...s,
          events: s.events.map((x) =>
            x.id === eventId ? { ...x, attended: [...(x.attended ?? []).filter((a) => a.userId !== userId), { userId, at: now() }] } : x
          ),
        }));
        log({ actorId: userId, action: "Joined online event", target: ev.title, campusId: ev.campusIds === "all" ? undefined : ev.campusIds[0], category: "community" });
      },
      rsvp: (eventId, userId, status, guests) => {
        const ev = stateRef.current.events.find((x) => x.id === eventId);
        const u = getUser(userId);
        setState((s) => ({
          ...s,
          events: s.events.map((x) => (x.id === eventId ? { ...x, rsvps: [...x.rsvps.filter((r) => r.userId !== userId), { userId, status, at: now(), guests }] } : x)),
        }));
        if (ev && u && status === "going")
          pushOutbox({
            channel: u.mobile.startsWith("+91") ? "whatsapp" : "email",
            to: `${u.name}`,
            toUserId: u.id,
            body: `You're registered for ${ev.title}, ${new Date(ev.start).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}. ${ev.online ? "We'll send the joining link an hour before." : `Venue: ${ev.venue}.`}`,
          });
      },
      addPost: (groupId, authorId, text) => {
        setState((s) => ({ ...s, posts: [{ id: uid("gp"), groupId, authorId, text, at: now(), likes: [] }, ...s.posts] }));
      },
      toggleLike: (postId, userId) => {
        setState((s) => ({
          ...s,
          posts: s.posts.map((p) => (p.id === postId ? { ...p, likes: p.likes.includes(userId) ? p.likes.filter((l) => l !== userId) : [...p.likes, userId] } : p)),
        }));
      },
      openDm: (a, b) => {
        const existing = stateRef.current.dmThreads.find((t) => t.members.includes(a) && t.members.includes(b));
        if (existing) return existing.id;
        const id = uid("dm");
        setState((s) => ({ ...s, dmThreads: [{ id, members: [a, b], createdAt: now() }, ...s.dmThreads] }));
        return id;
      },
      sendDm: (threadId, senderId, text) => {
        const t = stateRef.current.dmThreads.find((x) => x.id === threadId);
        setState((s) => ({ ...s, dms: [...s.dms, { id: uid("dmm"), threadId, senderId, text: text.trim(), at: now() }] }));
        const other = t ? getUser(t.members.find((m) => m !== senderId)!) : undefined;
        if (other) pushOutbox({ channel: "push", to: other.name, toUserId: other.id, body: `${getUser(senderId)?.name}: ${text.trim().slice(0, 80)}` });
      },
      sendInvite: (by, to, channel) => {
        const u = getUser(by);
        setState((s) => ({ ...s, invites: [{ id: uid("inv"), by, to, channel, at: now(), joined: false }, ...s.invites] }));
        pushOutbox({
          channel,
          to,
          body: `${u?.name} (VIBGYOR ${u?.batch ? `Batch ${u.batch}` : "alumni"}) invited you to the VIBGYOR Alumni Association. Join or claim your profile: vaa.vibgyor.in/join?ref=${by}`,
          link: { label: "Join VAA", href: `/join?ref=${by}` },
        });
        log({ actorId: by, action: "Invited a friend", target: channel === "email" ? to.replace(/(.).+@/, "$1***@") : "WhatsApp contact", campusId: u?.campusIds[0], category: "community" });
      },
    };
  }, [state, hydrated, user, log, pushOutbox]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
