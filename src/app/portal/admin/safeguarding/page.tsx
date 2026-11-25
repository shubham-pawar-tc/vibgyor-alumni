"use client";

import { useState } from "react";
import { Ban, Bot, CheckCircle2, Eye, Flag, MessagesSquare, RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react";
import { Avatar, Button, Callout, Card, Empty, Modal, PageHeader, Pill, Req, Tabs } from "@/components/ui";
import { MaskedText } from "@/components/MaskPreview";
import { AdminOnly, useScope } from "@/components/admin";
import { campusName } from "@/lib/data";
import { activeBadge, hasBadge, useStore } from "@/lib/store";
import { cn, formatDateTime, hoursSince, timeAgo } from "@/lib/utils";

type Tab = "reports" | "conversations" | "mentors";

function Inner() {
  const { me, state, resolveReport, setBadgeStatus, logView } = useStore();
  const { inScope, group } = useScope();
  const [tab, setTab] = useState<Tab>("reports");
  const [showClosed, setShowClosed] = useState(false);
  const [viewConv, setViewConv] = useState<string | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState<{ userId: string; reportId?: string } | null>(null);

  const reports = state.reports.filter((r) => inScope(r.campusId));
  const open = reports.filter((r) => r.status === "open");
  const closed = reports.filter((r) => r.status !== "open");
  const convs = state.conversations.filter((c) => inScope(c.campusId));
  const mentorIds = new Set([
    ...convs.map((c) => c.mentorId),
    ...state.users.filter((u) => hasBadge(u, "Mentor") && inScope(u.campusIds[0])).map((u) => u.id),
  ]);
  const mentors = state.users.filter((u) => mentorIds.has(u.id) && hasBadge(u, "Mentor"));

  const openConv = (id: string) => {
    const c = state.conversations.find((x) => x.id === id);
    const s = c && state.users.find((u) => u.id === c.studentId);
    const m = c && state.users.find((u) => u.id === c.mentorId);
    logView(me!.id, `${s?.name} ↔ ${m?.name}`, c?.campusId);
    setViewConv(id);
  };

  const conv = viewConv ? state.conversations.find((c) => c.id === viewConv) : undefined;

  return (
    <>
      <PageHeader
        eyebrow={<div className="flex flex-wrap gap-1.5"><Req ids="CS-5" /> <Req ids="CS-7" /> <Req ids="CS-9" /> <Req ids="L6" /> <Req ids="CS-16" /></div>}
        title="Safeguarding"
        description={`Reports, auto-flags and every student–mentor conversation${group ? " across all campuses" : ` for ${campusName(me?.campusIds[0])} students`}. Target: respond within 24 hours.`}
      />
      <div className="mb-5">
        <Tabs
          tabs={[
            { id: "reports", label: "Reports", count: open.length },
            { id: "conversations", label: "Student conversations", count: convs.length },
            { id: "mentors", label: "Mentor badges", count: mentors.length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "reports" && (
        <div className="space-y-4">
          {open.length === 0 && (
            <Card>
              <Empty icon={<ShieldCheck className="h-6 w-6" />} title="No open reports">
                Auto-flags and reports from students or mentors will appear here.
              </Empty>
            </Card>
          )}
          {(showClosed ? [...open, ...closed] : open).map((r) => {
            const msg = r.messageId ? state.messages.find((m) => m.id === r.messageId) : undefined;
            const subject = state.users.find((u) => u.id === r.subjectUserId);
            const reporter = r.reporterId === "system" ? undefined : state.users.find((u) => u.id === r.reporterId);
            const age = hoursSince(r.at);
            const isMentor = !!hasBadge(subject, "Mentor");
            const overdue = r.status === "open" && age > 24;
            return (
              <Card key={r.id} className={cn("p-5", r.status !== "open" && "opacity-70")}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", r.reporterId === "system" ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger")}>
                    {r.reporterId === "system" ? <Bot className="h-5 w-5" /> : <Flag className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{r.reason}</p>
                      {r.status === "open" ? (
                        <Pill tone={overdue ? "danger" : "warning"}>{overdue ? "Overdue" : `${Math.max(0, Math.round(24 - age))}h left`}</Pill>
                      ) : (
                        <Pill tone="success">{r.resolution}</Pill>
                      )}
                    </div>
                    <p className="mt-1 text-[12.5px] text-muted">
                      {reporter ? `Reported by ${reporter.name}` : "Raised automatically"} · {timeAgo(r.at)} · about {subject?.name} ({subject?.role === "STU" ? "student" : isMentor ? "mentor" : "alumnus"})
                    </p>
                    {msg && (
                      <div className="mt-3 rounded-xl bg-surface-2 px-3.5 py-2.5 text-[13.5px] leading-relaxed">
                        <MaskedText text={msg.text} />
                      </div>
                    )}
                  </div>
                </div>
                {r.status === "open" && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 md:pl-14">
                    {r.convId && (
                      <Button size="sm" variant="secondary" onClick={() => openConv(r.convId!)}>
                        <Eye className="h-4 w-4" /> View conversation
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => resolveReport(r.id, "dismiss", me!.id)}>
                      <CheckCircle2 className="h-4 w-4" /> Dismiss
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => resolveReport(r.id, "warn", me!.id)}>
                      <TriangleAlert className="h-4 w-4" /> Send warning
                    </Button>
                    {isMentor && activeBadge(subject, "Mentor") && (
                      <Button size="sm" variant="danger" onClick={() => setConfirmSuspend({ userId: subject!.id, reportId: r.id })}>
                        <Ban className="h-4 w-4" /> Suspend Mentor badge
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
          {closed.length > 0 && (
            <button onClick={() => setShowClosed(!showClosed)} className="text-[13px] font-semibold text-primary">
              {showClosed ? "Hide" : "Show"} {closed.length} resolved report{closed.length > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {tab === "conversations" && (
        <Card className="overflow-hidden">
          {convs.length === 0 ? (
            <Empty icon={<MessagesSquare className="h-6 w-6" />} title="No student conversations yet" />
          ) : (
            <div className="divide-y divide-border">
              {convs.map((c) => {
                const s = state.users.find((u) => u.id === c.studentId)!;
                const m = state.users.find((u) => u.id === c.mentorId)!;
                const msgs = state.messages.filter((x) => x.convId === c.id);
                const masked = msgs.filter((x) => x.maskedKinds.length).length;
                return (
                  <div key={c.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                    <div className="flex -space-x-2">
                      <Avatar name={s.name} size={38} className="ring-2 ring-surface" />
                      <Avatar name={m.name} size={38} className="ring-2 ring-surface" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold">
                        {s.name} <span className="font-normal text-muted">(Class {s.className})</span> ↔ {m.name}
                      </p>
                      <p className="truncate text-[12.5px] text-muted">
                        {c.topic} · {msgs.length} messages · last {timeAgo(msgs.at(-1)?.at ?? c.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {masked > 0 && <Pill tone="warning">{masked} masked</Pill>}
                      <Button size="sm" variant="secondary" onClick={() => openConv(c.id)}>
                        <Eye className="h-4 w-4" /> Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {tab === "mentors" && (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {mentors.map((m) => {
              const b = hasBadge(m, "Mentor")!;
              return (
                <div key={m.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={m.name} size={40} />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold">{m.name}</p>
                      <p className="truncate text-[12.5px] text-muted">
                        Batch {m.batch} · {campusName(m.campusIds[0]).split(",")[0]} · {m.title}, {m.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={b.status === "active" ? "success" : "danger"}>{b.status === "active" ? "Active" : "Suspended"}</Pill>
                    {b.status === "active" ? (
                      <Button size="sm" variant="secondary" onClick={() => setConfirmSuspend({ userId: m.id })}>
                        <Ban className="h-4 w-4" /> Suspend
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setBadgeStatus(m.id, "Mentor", "active", me!.id)}>
                        <RotateCcw className="h-4 w-4" /> Reinstate
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Transcript */}
      <Modal open={!!conv} onClose={() => setViewConv(null)} title="Conversation transcript" wide>
        {conv && (
          <div className="space-y-4">
            <Callout tone="info">This view has been recorded in the audit log (who, what, when).</Callout>
            <div className="space-y-3">
              {state.messages
                .filter((m) => m.convId === conv.id)
                .map((m) => {
                  const u = state.users.find((x) => x.id === m.senderId);
                  return (
                    <div key={m.id} className="flex gap-3">
                      <Avatar name={u?.name ?? "?"} size={30} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] text-muted">
                          <span className="font-semibold text-text">{u?.name}</span> · {u?.role === "STU" ? "student" : "mentor"} · {formatDateTime(m.at)}
                        </p>
                        <div className={cn("mt-1 rounded-xl px-3.5 py-2.5 text-[13.5px] leading-relaxed", m.maskedKinds.length ? "bg-warning-soft/60 ring-1 ring-warning/30" : "bg-surface-2")}>
                          <MaskedText text={m.text} />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <p className="text-[12px] text-muted">Messages are kept for the retention period VIBGYOR sets and can&apos;t be deleted by either party.</p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmSuspend}
        onClose={() => setConfirmSuspend(null)}
        title="Suspend Mentor badge?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmSuspend(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!confirmSuspend) return;
                if (confirmSuspend.reportId) resolveReport(confirmSuspend.reportId, "suspend", me!.id);
                else setBadgeStatus(confirmSuspend.userId, "Mentor", "suspended", me!.id);
                setConfirmSuspend(null);
              }}
            >
              Suspend now
            </Button>
          </>
        }
      >
        <ul className="space-y-2 text-[14px]">
          <li>• Hidden from student mentor search immediately</li>
          <li>• All their student conversations become read-only</li>
          <li>• The action is logged and can be reversed</li>
        </ul>
      </Modal>
    </>
  );
}

export default function SafeguardingPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <Inner />
    </AdminOnly>
  );
}
