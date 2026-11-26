"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { consentPurposes, createSeedState, masterUserKey, REQUEST_DAYS, erpRecords, ERP_EARLIEST_YEAR, migratedRecords, NOTICE_VERSION, STATE_VERSION } from "./data";
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
  Broadcast,
  ConsentPurpose,
  MatchField,
  OutboxMsg,
  State,
  User,
  VerificationRequest,
} from "./types";
import { childTag, firstName, maskMobile, uid } from "./utils";

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
  applyBadge: (userId: string, badge: BadgeType, motivation: string) => void;
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
  createEvent: (e: Omit<VaaEvent, "id" | "createdAt" | "rsvps">) => void;
  rsvp: (eventId: string, userId: string, status: RsvpStatus, guests?: number) => void;
  addPost: (groupId: string, authorId: string, text: string) => void;
  toggleLike: (postId: string, userId: string) => void;
  openDm: (a: string, b: string) => string;
  sendDm: (threadId: string, senderId: string, text: string) => void;
  sendInvite: (by: string, to: string, channel: "email" | "whatsapp") => void;
  // Phase 3 – administration
  editUser: (userId: string, fields: Partial<User>, actorId: string) => void;
  setDeactivated: (userId: string, off: boolean, actorId: string) => void;
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
        if (!stu) return;
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
          const otherId = senderId === conv.studentId ? conv.mentorId : conv.studentId;
          const other = getUser(otherId);
          if (other && other.role !== "STU") {
            pushOutbox({
              channel: "push",
              to: other.name,
              toUserId: other.id,
              body: `New message from ${getUser(senderId)?.name} (student) · open the VAA app to reply`,
              link: { label: "Open messages", href: `/portal/messages?c=${convId}` },
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
                : `Hi ${firstName(req.name)}, your campus alumni office needs a little more information to verify you: ${note || "please upload a school ID or leaving certificate"}.`,
        });
      },
      vouch: (id, voucherId) => {
        const req = stateRef.current.verifications.find((v) => v.id === id);
        const voucher = getUser(voucherId);
        if (!req || !voucher || req.vouches.some((v) => v.by === voucherId)) return;
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
      applyBadge: (userId, badge, motivation) => {
        const u = getUser(userId);
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
        setState((s) => ({ ...s, users: s.users.map((x) => (x.id === userId ? { ...x, ...fields } : x)) }));
        log({ actorId, action: "Alumni record edited", target: u?.name ?? userId, campusId: u?.campusIds[0], category: "admin", detail: Object.keys(fields).join(", ") });
      },
      setDeactivated: (userId, off, actorId) => {
        const u = getUser(userId);
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
      markInterest: (jobId, userId, note) => {
        const j = stateRef.current.jobs.find((x) => x.id === jobId);
        const u = getUser(userId);
        if (!j || !u) return;
        setState((s) => ({ ...s, jobs: s.jobs.map((x) => (x.id === jobId ? { ...x, interested: [...x.interested.filter((i) => i.userId !== userId), { userId, at: now(), note }] } : x)) }));
        if (u.role === "STU") {
          // students never contact the employer directly: it goes to the campus career counsellor (CS-4)
          const tch = stateRef.current.users.find((x) => x.role === "TCH" && x.campusIds.includes(u.campusIds[0]));
          if (tch)
            pushOutbox({ channel: "email", to: `${tch.name} · ${tch.email}`, toUserId: tch.id, body: `Subject: Student interest – ${j.title}\n\n${u.name} (Class ${u.className}) is interested in "${j.title}" at ${j.company}. Please check with the parent before passing the application on.` });
          log({ actorId: userId, action: "Student interest sent to career counsellor", target: `${j.title} · ${j.company}`, campusId: u.campusIds[0], category: "community" });
        } else {
          const poster = getUser(j.postedBy);
          if (poster)
            pushOutbox({ channel: "email", to: `${poster.name} · ${poster.email}`, toUserId: poster.id, body: `Subject: ${u.name} is interested in ${j.title}\n\n${u.name} (Batch ${u.batch}, ${u.title ?? ""}${u.company ? " at " + u.company : ""}) marked interest.${note ? `\n\n"${note}"` : ""}\n\nReply from your VAA chats.` });
        }
      },
      createEvent: (e) => {
        setState((s) => ({ ...s, events: [{ ...e, id: uid("ev"), createdAt: now(), rsvps: [] }, ...s.events] }));
        log({ actorId: e.createdBy, action: "Event created", target: e.title, campusId: e.campusIds === "all" ? undefined : e.campusIds[0], category: "community", detail: `${e.kind} · for ${e.audience.join(", ")}` });
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
          link: { label: "Join VAA", href: "/join" },
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
