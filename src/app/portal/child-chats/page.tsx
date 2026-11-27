"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye, Flag, Lock, MessagesSquare, SendHorizontal, ShieldCheck } from "lucide-react";
import { Avatar, Button, Callout, Card, Empty, Modal, PageHeader, Pill, Req, Tabs, Textarea } from "@/components/ui";
import { MaskedText, MaskPreview } from "@/components/MaskPreview";
import { campusName } from "@/lib/data";
import { activeBadge, hasBadge, hasConsent, useStore } from "@/lib/store";
import type { Message } from "@/lib/types";
import { cn, firstName, formatDateTime, timeAgo } from "@/lib/utils";

const reasons = [
  "The mentor asked for contact details or to talk off the platform",
  "Something made my child uncomfortable",
  "Inappropriate or offensive content",
  "Selling or promoting paid services",
  "Something else",
];

/**
 * Parents can read their child's student–mentor conversations and join them: a parent's message goes
 * into the same conversation, so the child, the mentor and the campus office all see it. Parents can't
 * start a conversation (only the child can). Same masking, recording and lock rules as the child.
 * Every opened conversation is written to the audit log, and any message can be reported.
 */
export default function ChildChatsPage() {
  const { me, state, reportMessage, log } = useStore();
  const [childId, setChildId] = useState("");
  const [convId, setConvId] = useState("");
  const [reportFor, setReportFor] = useState<Message | null>(null);
  const [reason, setReason] = useState(reasons[0]);
  const [reported, setReported] = useState<string[]>([]);
  const [logged, setLogged] = useState<string[]>([]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("child");
    if (q) setChildId(q);
  }, []);

  const kids = useMemo(
    () => (me?.childIds ?? []).map((id) => state.users.find((u) => u.id === id)).filter((u): u is NonNullable<typeof u> => !!u),
    [me?.childIds, state.users]
  );
  const child = kids.find((k) => k.id === childId) ?? kids[0];

  const convs = useMemo(
    () =>
      state.conversations
        .filter((c) => c.studentId === child?.id)
        .map((c) => ({ c, msgs: state.messages.filter((m) => m.convId === c.id) }))
        .sort((a, b) => Date.parse(b.msgs.at(-1)?.at ?? b.c.createdAt) - Date.parse(a.msgs.at(-1)?.at ?? a.c.createdAt)),
    [state.conversations, state.messages, child?.id]
  );
  const active = convs.find((x) => x.c.id === convId);

  // Record each conversation a parent opens, like staff views (CS-16).
  useEffect(() => {
    if (!me || !child || !active || logged.includes(active.c.id)) return;
    const mentor = state.users.find((u) => u.id === active.c.mentorId);
    log({
      actorId: me.id,
      action: "Parent viewed mentor conversation",
      target: `${child.name} ↔ ${mentor?.name ?? "mentor"}`,
      campusId: active.c.campusId,
      category: "data_access",
      detail: active.c.topic,
    });
    setLogged((l) => [...l, active.c.id]);
  }, [active, child, me, log, logged, state.users]);

  if (!me) return null;
  if (me.role !== "PAR")
    return <Callout tone="warning">This page is for parents and guardians. Switch to a parent to try it.</Callout>;

  const mentorOn = child ? hasConsent(state, child.id, "mentor") : false;

  return (
    <>
      <PageHeader
        eyebrow={
          <div className="flex gap-2">
            <Req ids="CS-5" /> <Req ids="CS-16" />
          </div>
        }
        title="Mentor chats"
        description="Read your child's conversations with alumni mentors and join in to message the mentor yourself. Your child, the mentor and the campus office see everything you write."
      />

      {kids.length > 1 && child && (
        <div className="mb-5">
          <Tabs
            tabs={kids.map((k) => ({ id: k.id, label: firstName(k.name), count: state.conversations.filter((c) => c.studentId === k.id).length }))}
            value={child.id}
            onChange={(id) => {
              setChildId(id);
              setConvId("");
            }}
          />
        </div>
      )}

      {!child ? (
        <Card>
          <Empty icon={<MessagesSquare className="h-6 w-6" />} title="No children linked to your account" />
        </Card>
      ) : (
        <>
          {!mentorOn && (
            <Callout tone="info" className="mb-5" title={`Mentor contact is off for ${firstName(child.name)}`}>
              {firstName(child.name)} can&apos;t start or reply to mentor conversations. Any past conversations below are read-only for everyone, including you. You can switch mentor contact on in the Consent centre.
            </Callout>
          )}

          {convs.length === 0 ? (
            <Card>
              <Empty icon={<MessagesSquare className="h-6 w-6" />} title={`${firstName(child.name)} has no mentor conversations yet`}>
                When {firstName(child.name)} asks a mentor a question, the conversation appears here and you can join it.
              </Empty>
            </Card>
          ) : (
            <Card className="grid min-h-[520px] overflow-hidden lg:grid-cols-[320px_1fr]">
              {/* List */}
              <div className={cn("flex min-h-0 flex-col border-r border-border", active && "hidden lg:flex")}>
                <div className="border-b border-border px-4 py-3 text-label font-semibold uppercase tracking-[0.08em] text-muted">
                  {firstName(child.name)} · {convs.length} conversation{convs.length > 1 ? "s" : ""}
                </div>
                <div className="flex-1 overflow-y-auto">
                  {convs.map(({ c, msgs }) => {
                    const m = state.users.find((u) => u.id === c.mentorId);
                    const last = msgs.at(-1);
                    const flagged = msgs.some((x) => x.maskedKinds.length > 0);
                    return (
                      <button
                        key={c.id}
                        onClick={() => setConvId(c.id)}
                        className={cn("flex w-full items-start gap-3 border-b border-border px-4 py-4 text-left hover:bg-surface-2/70", active?.c.id === c.id && "bg-primary-soft/60")}
                      >
                        <Avatar name={m?.name ?? "?"} size={40} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate text-body font-semibold">{m?.name}</p>
                            {last && <span className="shrink-0 text-xs text-muted">{timeAgo(last.at)}</span>}
                          </div>
                          <p className="truncate text-label font-medium text-primary">{c.topic}</p>
                          <p className="truncate text-sm text-muted">{last?.text}</p>
                          {flagged && (
                            <Pill tone="warning" className="mt-1 !py-0 !text-xs">
                              contact details hidden
                            </Pill>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transcript */}
              {active ? (
                <Transcript
                  child={child}
                  conv={active.c}
                  msgs={active.msgs}
                  onBack={() => setConvId("")}
                  reported={reported}
                  onReport={(m) => {
                    setReportFor(m);
                    setReason(reasons[0]);
                  }}
                />
              ) : (
                <div className="hidden items-center justify-center lg:flex">
                  <Empty icon={<MessagesSquare className="h-6 w-6" />} title="Select a conversation" />
                </div>
              )}
            </Card>
          )}
        </>
      )}

      <Modal
        open={!!reportFor}
        onClose={() => setReportFor(null)}
        title="Report this message"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReportFor(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!reportFor) return;
                reportMessage(reportFor.id, me.id, `Parent report: ${reason}`);
                setReported((r) => [...r, reportFor.id]);
                setReportFor(null);
              }}
            >
              <Flag className="h-4 w-4" /> Send report
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-surface-2 p-3 text-body">
            <MaskedText text={reportFor?.text ?? ""} />
          </div>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">What&apos;s wrong?</legend>
            {reasons.map((r) => (
              <label key={r} className="flex items-center gap-3 text-sm">
                <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="h-4 w-4 accent-[var(--primary)]" />
                {r}
              </label>
            ))}
          </fieldset>
          <Callout tone="info">The campus alumni office reviews reports within 24 hours and can suspend the mentor straight away.</Callout>
        </div>
      </Modal>
    </>
  );
}

function Transcript({
  child,
  conv,
  msgs,
  onBack,
  reported,
  onReport,
}: {
  child: { id: string; name: string; studentStatus?: string };
  conv: { id: string; studentId: string; mentorId: string; campusId: string; createdAt: string; topic: string };
  msgs: Message[];
  onBack: () => void;
  reported: string[];
  onReport: (m: Message) => void;
}) {
  const { me, state, sendMessage } = useStore();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs.length, conv.id]);
  const childName = child.name;
  const mentor = state.users.find((u) => u.id === conv.mentorId);
  const suspended = mentor && !activeBadge(mentor, "Mentor");
  // Same locks as the child's own view (CS-3 / CS-9)
  const lock =
    child.studentStatus !== "active"
      ? `${firstName(childName)}'s account is paused, so this conversation is read-only.`
      : !hasConsent(state, child.id, "mentor")
        ? "Mentor contact is switched off, so this conversation is read-only. Switch it on in the Consent centre to reply."
        : mentor && hasBadge(mentor, "Mentor")?.status === "suspended"
          ? "This mentor's badge is suspended while the campus reviews a report. The conversation is read-only."
          : null;
  const send = () => {
    if (!me || !draft.trim() || lock) return;
    sendMessage(conv.id, me.id, draft);
    setDraft("");
  };
  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button className="grid h-9 w-9 place-items-center rounded-xl hover:bg-surface-2 lg:hidden" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={mentor?.name ?? "?"} size={38} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {mentor?.name} {suspended && <Pill tone="danger" className="ml-1 !py-0 !text-xs">badge suspended</Pill>}
          </p>
          <p className="truncate text-label text-muted">
            Mentor · {mentor?.title}, {mentor?.company} · Batch {mentor?.batch}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-primary-soft/60 px-4 py-2 text-label font-medium text-primary">
        <Eye className="h-3.5 w-3.5 shrink-0" />
        <span>Seen by {firstName(childName)}, the mentor and the {campusName(conv.campusId).split(",")[0]} alumni office · contact details are hidden</span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        <p className="text-center text-label text-muted">
          Conversation started {formatDateTime(conv.createdAt)} · <span className="font-medium">{conv.topic}</span>
        </p>
        {msgs.map((m) => {
          const fromChild = m.senderId === conv.studentId;
          const fromMe = m.senderId === me?.id;
          const sender = state.users.find((u) => u.id === m.senderId);
          const label = fromMe ? "You" : fromChild ? firstName(childName) : sender?.role === "PAR" ? `${sender.name} · parent` : sender?.name;
          return (
            <div key={m.id} className={cn("group flex gap-3", (fromChild || fromMe) && "flex-row-reverse")}>
              <Avatar name={sender?.name ?? "?"} size={30} className="mt-1" />
              <div className={cn("max-w-[78%]", (fromChild || fromMe) && "text-right")}>
                <p className="mb-0.5 text-xs font-semibold text-muted">{label}</p>
                <div
                  className={cn(
                    "inline-block rounded-2xl px-4 py-3 text-left text-sm leading-relaxed",
                    fromMe ? "rounded-br-md bg-success text-white" : fromChild ? "rounded-br-md bg-primary text-primary-fg" : "rounded-bl-md bg-surface-2"
                  )}
                >
                  <MaskedText text={m.text} />
                </div>
                <div className={cn("mt-1 flex items-center gap-2 text-xs text-muted", (fromChild || fromMe) && "justify-end")}>
                  <span>{formatDateTime(m.at)}</span>
                  {m.maskedKinds.length > 0 && <Pill tone="warning" className="!py-0 !text-xs">masked · campus notified</Pill>}
                  {fromMe ? null : reported.includes(m.id) ? (
                    <span className="font-semibold text-success">Reported</span>
                  ) : (
                    <button onClick={() => onReport(m)} className="inline-flex items-center gap-1 font-semibold opacity-70 hover:text-danger hover:opacity-100">
                      <Flag className="h-3 w-3" /> Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border p-3 sm:p-4">
        {lock ? (
          <Callout tone="warning" title="Read-only">
            <span className="inline-flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" /> {lock}
            </span>
          </Callout>
        ) : (
          <div className="space-y-2">
            <MaskPreview text={draft} />
            <div className="flex items-end gap-2">
              <Textarea
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={`Message ${mentor ? firstName(mentor.name) : "the mentor"} (${firstName(childName)} sees this too)…`}
                className="max-h-32 min-h-11 resize-none"
                aria-label="Message the mentor"
              />
              <Button onClick={send} disabled={!draft.trim()} className="h-11 w-11 shrink-0 !px-0" aria-label="Send">
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <p className="mt-2 flex items-center gap-2 text-label text-muted">
          <ShieldCheck className="h-3.5 w-3.5" /> Messages can&apos;t be deleted by anyone. Phone numbers, emails and links are hidden for parents too. Opening this conversation was recorded.
        </p>
      </div>
    </div>
  );
}
