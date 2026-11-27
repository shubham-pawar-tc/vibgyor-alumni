"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Flag, Lock, MessagesSquare, SendHorizontal, ShieldCheck, Video } from "lucide-react";
import { Avatar, Button, Callout, Card, Empty, Modal, Pill, Req, Textarea } from "@/components/ui";
import { MaskedText, MaskPreview } from "@/components/MaskPreview";
import { campusName } from "@/lib/data";
import { activeBadge, hasBadge, hasConsent, useStore } from "@/lib/store";
import type { Message } from "@/lib/types";
import { cn, firstName, formatDateTime, timeAgo } from "@/lib/utils";

const reasons = [
  "Asked for contact details or to talk off the platform",
  "Made me uncomfortable",
  "Inappropriate or offensive content",
  "Spam or advertising",
  "Something else",
];

function MessagesInner() {
  const { me, state, sendMessage, reportMessage } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const activeId = params.get("c");
  const [draft, setDraft] = useState("");
  const [reportFor, setReportFor] = useState<Message | null>(null);
  const [reason, setReason] = useState(reasons[0]);
  const [reported, setReported] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const convs = useMemo(
    () =>
      state.conversations
        .filter((c) => c.studentId === me?.id || c.mentorId === me?.id)
        .map((c) => ({ c, last: state.messages.filter((m) => m.convId === c.id).at(-1) }))
        .sort((a, b) => Date.parse(b.last?.at ?? b.c.createdAt) - Date.parse(a.last?.at ?? a.c.createdAt)),
    [state.conversations, state.messages, me?.id]
  );

  const active = convs.find((x) => x.c.id === activeId)?.c ?? (typeof window !== "undefined" && window.innerWidth >= 1024 ? convs[0]?.c : undefined);
  const thread = active ? state.messages.filter((m) => m.convId === active.id) : [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.length, active?.id]);

  if (!me) return null;

  if (convs.length === 0) {
    return (
      <Card>
        <Empty icon={<MessagesSquare className="h-6 w-6" />} title="No conversations yet">
          {me.role === "STU"
            ? "Find a mentor and ask your first question."
            : activeBadge(me, "Mentor")
              ? "When a student asks you a question, it appears here."
              : "To message other alumni, open Chats. Become a mentor to help students too."}
          <div className="mt-4">
            {me.role === "STU" ? <Button href="/portal/mentors">Find a mentor</Button> : !activeBadge(me, "Mentor") && <Button href="/portal/mentor">Become a mentor</Button>}
          </div>
        </Empty>
      </Card>
    );
  }

  const other = active ? state.users.find((u) => u.id === (me.id === active.studentId ? active.mentorId : active.studentId)) : undefined;
  const student = active ? state.users.find((u) => u.id === active.studentId) : undefined;
  const mentor = active ? state.users.find((u) => u.id === active.mentorId) : undefined;

  // CS-3 / CS-9: lock the thread if consent withdrawn or badge suspended
  let lock: string | null = null;
  if (active && student && mentor) {
    if (student.studentStatus !== "active") lock = "The student's account is paused, so this conversation is read-only.";
    else if (!hasConsent(state, student.id, "mentor")) lock = me.role === "STU" ? "Your parent has switched off mentor contact, so this conversation is read-only." : "The student's parent has withdrawn mentor contact, so this conversation is read-only.";
    else if (hasBadge(mentor, "Mentor")?.status === "suspended")
      lock = me.id === mentor.id ? "Your Mentor badge is suspended while your campus reviews a report. This conversation is read-only." : "This mentor is currently unavailable. The conversation is read-only.";
  }

  const send = () => {
    if (!active || !draft.trim() || lock) return;
    sendMessage(active.id, me.id, draft);
    setDraft("");
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{me.role === "STU" ? "Messages" : "Mentor inbox"}</h1>
        <div className="hidden gap-2 sm:flex">
          <Req ids="D2" /> <Req ids="CS-5" /> <Req ids="CS-6" /> <Req ids="CS-7" /> <Req ids="CS-8" />
        </div>
      </div>
      <Card className="grid h-[calc(100dvh-180px)] min-h-[520px] overflow-hidden lg:grid-cols-[320px_1fr]">
        {/* List */}
        <div className={cn("flex min-h-0 flex-col border-r border-border", active && "hidden lg:flex")}>
          <div className="border-b border-border px-4 py-3 text-label font-semibold uppercase tracking-[0.08em] text-muted">{convs.length} conversation{convs.length > 1 ? "s" : ""}</div>
          <div className="flex-1 overflow-y-auto">
            {convs.map(({ c, last }) => {
              const o = state.users.find((u) => u.id === (me.id === c.studentId ? c.mentorId : c.studentId));
              if (!o) return null;
              return (
                <button
                  key={c.id}
                  onClick={() => router.replace(`/portal/messages?c=${c.id}`)}
                  className={cn("flex w-full items-start gap-3 border-b border-border px-4 py-4 text-left hover:bg-surface-2/70", active?.id === c.id && "bg-primary-soft/60")}
                >
                  <Avatar name={o.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-body font-semibold">{o.name}</p>
                      {last && <span className="shrink-0 text-xs text-muted">{timeAgo(last.at)}</span>}
                    </div>
                    <p className="truncate text-label font-medium text-primary">{c.topic}</p>
                    <p className="truncate text-sm text-muted">{last?.text}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread */}
        {active && other ? (
          <div className="flex min-h-0 flex-col">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button className="grid h-9 w-9 place-items-center rounded-xl hover:bg-surface-2 lg:hidden" onClick={() => router.replace("/portal/messages")} aria-label="Back">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar name={other.name} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{other.name}</p>
                <p className="truncate text-label text-muted">
                  {other.role === "STU" ? `Student · Class ${other.className} · ${campusName(other.campusIds[0])}` : `Mentor · ${other.title}, ${other.company}`}
                </p>
              </div>
              <span title="Video calls with students aren't available in Release 1. From Release 2 they can be booked through the platform only (CS-8).">
                <Button size="sm" variant="secondary" disabled aria-label="Video call unavailable">
                  <Video className="h-4 w-4" />
                </Button>
              </span>
            </div>

            <div className="flex items-center gap-2 bg-primary-soft/60 px-4 py-2 text-label font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Recorded and visible to the {campusName(active.campusId).split(",")[0]} alumni office and {me.role === "STU" ? "your parent" : "the student's parent"} · messages can&apos;t be deleted · contact details are hidden</span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              <p className="text-center text-label text-muted">
                Conversation started {formatDateTime(active.createdAt)} · <span className="font-medium">{active.topic}</span>
              </p>
              {thread.map((m) => {
                const mine = m.senderId === me.id;
                const sender = state.users.find((u) => u.id === m.senderId);
                return (
                  <div key={m.id} className={cn("group flex gap-3", mine && "flex-row-reverse")}>
                    {!mine && <Avatar name={sender?.name ?? "?"} size={30} className="mt-1" />}
                    <div className={cn("max-w-[78%]", mine && "items-end text-right")}>
                      {!mine && sender?.role === "PAR" && (
                        <p className="mb-0.5 text-xs font-semibold text-muted">
                          {sender.name} · {me.role === "STU" ? "your parent" : `${student ? firstName(student.name) + "'s " : ""}parent`}
                        </p>
                      )}
                      <div className={cn("inline-block rounded-2xl px-4 py-3 text-left text-sm leading-relaxed", mine ? "rounded-br-md bg-primary text-primary-fg" : "rounded-bl-md bg-surface-2")}>
                        <MaskedText text={m.text} />
                      </div>
                      <div className={cn("mt-1 flex items-center gap-2 text-xs text-muted", mine && "justify-end")}>
                        <span>{formatDateTime(m.at)}</span>
                        {m.maskedKinds.length > 0 && <Pill tone="warning" className="!py-0 !text-xs">masked · campus notified</Pill>}
                        {!mine &&
                          (reported.includes(m.id) ? (
                            <span className="font-semibold text-success">Reported</span>
                          ) : (
                            <button
                              onClick={() => {
                                setReportFor(m);
                                setReason(reasons[0]);
                              }}
                              className="inline-flex items-center gap-1 font-semibold opacity-70 hover:text-danger hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            >
                              <Flag className="h-3 w-3" /> Report
                            </button>
                          ))}
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
                      placeholder={`Message ${firstName(other.name)}…`}
                      className="max-h-32 min-h-11 resize-none"
                      aria-label="Message"
                    />
                    <Button onClick={send} disabled={!draft.trim()} className="h-11 w-11 shrink-0 !px-0" aria-label="Send">
                      <SendHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="hidden text-label text-muted sm:block">
                    Try: <button className="font-semibold text-primary" onClick={() => setDraft("Can I WhatsApp you? My number is 98200 12345 or insta @aarav.codes")}>a message with contact details</button>
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden items-center justify-center lg:flex">
            <Empty icon={<MessagesSquare className="h-6 w-6" />} title="Select a conversation" />
          </div>
        )}
      </Card>

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
                reportMessage(reportFor.id, me.id, reason);
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
              <label key={r} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-body", reason === r ? "border-primary bg-primary-soft/50" : "border-border")}>
                <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-[var(--primary)]" />
                {r}
              </label>
            ))}
          </fieldset>
          <p className="text-sm text-muted">Your campus alumni office will review this, usually within 24 hours. The other person won&apos;t see who reported it.</p>
        </div>
      </Modal>
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesInner />
    </Suspense>
  );
}
