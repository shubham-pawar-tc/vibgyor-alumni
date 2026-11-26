"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, BadgeCheck, Check, CheckCircle2, GraduationCap, HeartHandshake, Inbox, Minus, X } from "lucide-react";
import { Avatar, Button, Callout, Card, CardHeader, Empty, Field, Modal, PageHeader, Pill, Req, Tabs, Textarea } from "@/components/ui";
import { AdminOnly, NoPermission, useScope } from "@/components/admin";
import { campusName } from "@/lib/data";
import { can, useStore } from "@/lib/store";
import type { MatchField, VerificationRequest } from "@/lib/types";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";

type Tab = "queue" | "badges" | "decided";

const statusPill: Record<VerificationRequest["status"], React.ReactNode> = {
  pending: <Pill tone="warning">Pending</Pill>,
  auto_approved: <Pill tone="success">Auto-verified</Pill>,
  approved: <Pill tone="success">Approved</Pill>,
  peer_approved: <Pill tone="success">Peer-verified</Pill>,
  rejected: <Pill tone="danger">Rejected</Pill>,
  info_requested: <Pill tone="info">Info requested</Pill>,
};

function MatchIcon({ m }: { m?: MatchField }) {
  if (m === "match") return <span className="grid h-6 w-6 place-items-center rounded-full bg-success-soft text-success" title="Match"><Check className="h-3.5 w-3.5" /></span>;
  if (m === "partial") return <span className="grid h-6 w-6 place-items-center rounded-full bg-warning-soft text-warning" title="Close match"><AlertCircle className="h-3.5 w-3.5" /></span>;
  if (m === "mismatch") return <span className="grid h-6 w-6 place-items-center rounded-full bg-danger-soft text-danger" title="Mismatch"><X className="h-3.5 w-3.5" /></span>;
  return <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-muted" title="No record"><Minus className="h-3.5 w-3.5" /></span>;
}

function Inner() {
  const { me, state, decideVerification, decideBadge } = useStore();
  const canVerify = can(state, me, "verify");
  const { inScope, group } = useScope();
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "queue");
  const [selId, setSelId] = useState<string | null>(null);
  const [action, setAction] = useState<null | "rejected" | "info_requested">(null);
  const [note, setNote] = useState("");

  const all = state.verifications.filter((v) => inScope(v.campusId));
  const queue = all.filter((v) => v.status === "pending" || v.status === "info_requested");
  const decided = all.filter((v) => v.status !== "pending" && v.status !== "info_requested");
  const badges = state.badgeRequests.filter((b) => inScope(b.campusId));
  const sel = queue.find((v) => v.id === selId) ?? queue[0];

  return (
    <>
      <PageHeader
        eyebrow={<div className="flex gap-1.5"><Req ids="A2" /> <Req ids="CS-9" /> <Req ids="§5.2" /></div>}
        title="Verification"
        description={`Alumni who couldn't be matched to school records automatically, and badge requests${group ? " across all campuses" : ` for ${campusName(me?.campusIds[0])}`}.`}
      />
      <div className="mb-5">
        <Tabs
          tabs={[
            { id: "queue", label: "Alumni queue", count: queue.length },
            { id: "badges", label: "Badge requests", count: badges.filter((b) => b.status === "pending").length },
            { id: "decided", label: "Decided", count: decided.length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "queue" &&
        (queue.length === 0 ? (
          <Card>
            <Empty icon={<Inbox className="h-6 w-6" />} title="Queue is clear">
              New sign-ups that don&apos;t match school records will appear here.
            </Empty>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
            <Card className="overflow-hidden">
              <div className="divide-y divide-border">
                {queue.map((v) => (
                  <button key={v.id} onClick={() => setSelId(v.id)} className={cn("flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-2/70", sel?.id === v.id && "bg-primary-soft/60")}>
                    <Avatar name={v.name} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-semibold">{v.name}</p>
                      <p className="truncate text-[13px] text-muted">
                        Batch {v.passYear} · {campusName(v.campusId).split(",")[0]} · {timeAgo(v.submittedAt)}
                      </p>
                    </div>
                    {v.vouches.length > 0 && <Pill tone="primary">{v.vouches.length}/2</Pill>}
                  </button>
                ))}
              </div>
            </Card>

            {sel && (
              <Card>
                <CardHeader
                  title={sel.name}
                  subtitle={`${sel.method === "claim" ? "Claimed migrated profile" : "Self sign-up"} · ${sel.email} · submitted ${formatDateTime(sel.submittedAt)}`}
                  action={statusPill[sel.status]}
                />
                <div className="p-5">
                  <p className="mb-3 text-[14px] font-semibold">Submitted details vs school record (ERP)</p>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <div className="grid grid-cols-[1fr_1fr_1fr_36px] gap-2 bg-surface-2 px-4 py-2.5 text-[12.5px] font-semibold uppercase tracking-wider text-muted">
                      <span>Field</span>
                      <span>Submitted</span>
                      <span>School record</span>
                      <span />
                    </div>
                    {[
                      { f: "Name", a: sel.name, b: sel.closestRecord?.name, m: sel.fieldChecks?.name },
                      { f: "Campus", a: campusName(sel.campusId).split(",")[0], b: sel.closestRecord ? campusName(sel.closestRecord.campusId).split(",")[0] : undefined, m: sel.fieldChecks?.campus },
                      { f: "Pass year", a: String(sel.passYear), b: sel.closestRecord?.passYear?.toString(), m: sel.fieldChecks?.passYear },
                      { f: "Admission no.", a: sel.admissionNo, b: sel.closestRecord?.admissionNo, m: sel.fieldChecks?.admissionNo },
                    ].map((r) => (
                      <div key={r.f} className="grid grid-cols-[1fr_1fr_1fr_36px] items-center gap-2 border-t border-border px-4 py-3 text-[14px]">
                        <span className="text-muted">{r.f}</span>
                        <span className="break-words font-medium">{r.a}</span>
                        <span className={cn("break-words font-medium", !r.b && "text-muted")}>{r.b ?? "—"}</span>
                        <MatchIcon m={r.b ? r.m : "missing"} />
                      </div>
                    ))}
                  </div>
                  {sel.note && <Callout tone="info" className="mt-4">{sel.note}</Callout>}
                  {sel.fieldChecks?.admissionNo === "partial" && (
                    <Callout tone="warning" className="mt-4">
                      Admission numbers differ only by digit order, which usually means a typo. Name, campus and pass year match.
                    </Callout>
                  )}

                  <div className="mt-5 rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="h-4 w-4 text-primary" />
                      <p className="text-[14px] font-semibold">Peer vouches · {sel.vouches.length} of 2</p>
                    </div>
                    {sel.vouches.length === 0 ? (
                      <p className="mt-1.5 text-[14px] text-muted">No vouches yet.</p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {sel.vouches.map((x) => (
                          <li key={x.by} className="text-[14px]">
                            ✓ {x.byName} <span className="text-muted">· {timeAgo(x.at)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {!canVerify ? (
                    <div className="mt-5">
                      <NoPermission what="approve verifications" />
                    </div>
                  ) : (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button onClick={() => decideVerification(sel.id, "approved", me!.id)}>
                      <BadgeCheck className="h-4 w-4" /> Approve
                    </Button>
                    <Button variant="secondary" onClick={() => { setAction("info_requested"); setNote(""); }}>
                      Request info
                    </Button>
                    <Button variant="ghost" className="text-danger" onClick={() => { setAction("rejected"); setNote(""); }}>
                      Reject
                    </Button>
                  </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        ))}

      {tab === "badges" && (
        <Card className="overflow-hidden">
          {badges.length === 0 ? (
            <Empty icon={<GraduationCap className="h-6 w-6" />} title="No badge requests" />
          ) : (
            <div className="divide-y divide-border">
              {badges.map((b) => {
                const u = state.users.find((x) => x.id === b.userId);
                if (!u) return null;
                return (
                  <div key={b.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <Avatar name={u.name} size={42} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{u.name}</p>
                          <Pill tone="primary">{b.badge === "ServiceProvider" ? "Service provider" : b.badge}</Pill>
                          {b.status !== "pending" && <Pill tone={b.status === "approved" ? "success" : "danger"}>{b.status}</Pill>}
                        </div>
                        <p className="text-[13.5px] text-muted">
                          Batch {u.batch} · {u.title ? `${u.title}, ${u.company}` : campusName(u.campusIds[0])}
                        </p>
                        {b.badge === "ServiceProvider" && u.listing && (
                          <p className="mt-1 text-[13.5px]">
                            <b>{u.listing.business}</b> · {u.listing.category} · {u.listing.city}: {u.listing.description}
                          </p>
                        )}
                        {b.motivation && <p className="mt-1.5 text-[14px]">&ldquo;{b.motivation}&rdquo;</p>}
                        <p className="mt-1.5 flex items-center gap-1 text-[13px] text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Safeguarding code accepted {formatDateTime(b.codeAcceptedAt)}
                        </p>
                      </div>
                    </div>
                    {b.status === "pending" && !canVerify && <NoPermission what="approve badges" />}
                    {b.status === "pending" && canVerify && (
                      <div className="flex gap-2">
                        <Button onClick={() => decideBadge(b.id, true, me!.id)}>Approve</Button>
                        <Button variant="secondary" onClick={() => decideBadge(b.id, false, me!.id)}>
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {tab === "decided" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[14px]">
              <thead>
                <tr className="border-b border-border text-left text-[13px] text-muted">
                  <th className="px-5 py-3 font-semibold">Alumnus</th>
                  <th className="px-3 py-3 font-semibold">Campus · batch</th>
                  <th className="px-3 py-3 font-semibold">Outcome</th>
                  <th className="px-3 py-3 font-semibold">How</th>
                  <th className="px-5 py-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {decided.map((v) => (
                  <tr key={v.id}>
                    <td className="px-5 py-3 font-medium">{v.name}</td>
                    <td className="px-3 py-3 text-muted">
                      {campusName(v.campusId).split(",")[0]} · {v.passYear}
                    </td>
                    <td className="px-3 py-3">{statusPill[v.status]}</td>
                    <td className="px-3 py-3 text-muted">
                      {v.decidedBy === "system" ? (v.method === "claim" ? "Carried over (migration)" : "ERP match") : v.decidedBy === "peer" ? "2 peer vouches" : state.users.find((u) => u.id === v.decidedBy)?.name ?? "Staff"}
                    </td>
                    <td className="px-5 py-3 text-muted">{v.decidedAt ? timeAgo(v.decidedAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={!!action}
        onClose={() => setAction(null)}
        title={action === "rejected" ? "Reject verification" : "Request more information"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button
              variant={action === "rejected" ? "danger" : "primary"}
              disabled={!note.trim()}
              onClick={() => {
                if (sel && action) decideVerification(sel.id, action, me!.id, note.trim());
                setAction(null);
              }}
            >
              {action === "rejected" ? "Reject" : "Send request"}
            </Button>
          </>
        }
      >
        <Field label={action === "rejected" ? "Reason (sent to the applicant)" : "What do you need?"} htmlFor="note">
          <Textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={action === "rejected" ? "e.g. No record of this name in the 2015 batch." : "e.g. Please upload your school leaving certificate."} />
        </Field>
      </Modal>
    </>
  );
}

export default function VerificationPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <Suspense>
        <Inner />
      </Suspense>
    </AdminOnly>
  );
}
