"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Briefcase, CheckCircle2, Clock, FileText, MessageSquareWarning, UserRound } from "lucide-react";
import { AdminOnly, NoPermission, useScope } from "@/components/admin";
import { MaskedText } from "@/components/MaskPreview";
import { Avatar, Button, Card, Empty, PageHeader, Pill, Req, Stat, Tabs } from "@/components/ui";
import { campusName, MODERATION_SLA_HOURS } from "@/lib/data";
import { can, useStore } from "@/lib/store";
import type { Report } from "@/lib/types";
import { hoursSince, timeAgo } from "@/lib/utils";

const kindIcon = { post: FileText, job: Briefcase, profile: UserRound, message: MessageSquareWarning } as const;

export default function ModerationPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <Moderation />
    </AdminOnly>
  );
}

function fmtHours(h: number) {
  return h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} days`;
}

function Moderation() {
  const { me, state, resolveModeration } = useStore();
  const { inScope } = useScope();
  const [tab, setTab] = useState<"open" | "done">("open");
  if (!me) return null;
  const all = state.reports.filter((r) => r.kind !== "message" && inScope(r.campusId));
  const open = all.filter((r) => r.status === "open").sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const done = all.filter((r) => r.status !== "open").sort((a, b) => Date.parse(b.resolvedAt ?? b.at) - Date.parse(a.resolvedAt ?? a.at));
  const overdue = open.filter((r) => hoursSince(r.at) > MODERATION_SLA_HOURS).length;
  const resp = done.filter((r) => r.resolvedAt).map((r) => (Date.parse(r.resolvedAt!) - Date.parse(r.at)) / 3600_000);
  const avg = resp.length ? resp.reduce((a, b) => a + b, 0) / resp.length : 0;
  const allowed = can(state, me, "content.moderate");
  const list = tab === "open" ? open : done;

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="L6 · CS-7" />}
        title="Moderation"
        description={`Reported posts, jobs and profiles. Target: first action within ${MODERATION_SLA_HOURS} hours [TBC with VIBGYOR]. Reported student chats stay in Safeguarding.`}
      />
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Waiting" value={open.length} tone={open.length ? "warning" : "success"} />
        <Stat label={`Older than ${MODERATION_SLA_HOURS} h`} value={overdue} tone={overdue ? "danger" : "success"} />
        <Stat label="Average response" value={resp.length ? fmtHours(avg) : "—"} />
      </div>
      <div className="mb-4">
        <Tabs
          tabs={[
            { id: "open", label: "Waiting", count: open.length },
            { id: "done", label: "Resolved", count: done.length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {list.length === 0 ? (
        <Card>
          <Empty icon={<CheckCircle2 className="h-6 w-6" />} title={tab === "open" ? "Nothing waiting" : "Nothing resolved yet"}>
            Members report content with the flag button on posts, jobs and profiles.
          </Empty>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((r) => (
            <ReportCard key={r.id} r={r} allowed={allowed} onAct={(a) => resolveModeration(r.id, a, me.id)} />
          ))}
        </div>
      )}
    </>
  );
}

function ReportCard({ r, allowed, onAct }: { r: Report; allowed: boolean; onAct: (a: "dismiss" | "warn" | "remove") => void }) {
  const { state } = useStore();
  const Icon = kindIcon[r.kind];
  const subject = state.users.find((u) => u.id === r.subjectUserId);
  const reporter = state.users.find((u) => u.id === r.reporterId);
  const post = r.postId ? state.posts.find((p) => p.id === r.postId) : undefined;
  const job = r.jobId ? state.jobs.find((j) => j.id === r.jobId) : undefined;
  const age = hoursSince(r.at);
  const late = r.status === "open" && age > MODERATION_SLA_HOURS;
  const removeLabel = r.kind === "post" ? "Remove post" : r.kind === "job" ? "Take job down" : "Deactivate account";

  return (
    <Card className={`p-5 ${late ? "border-danger/50" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-[14px] font-semibold capitalize">{r.kind} reported</p>
        <Pill tone="warning">{r.reason}</Pill>
        <span className="flex-1" />
        {r.status === "open" ? (
          <Pill tone={late ? "danger" : "neutral"} icon={late ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}>
            {late ? `Overdue · ${fmtHours(age)}` : `${fmtHours(age)} ago`}
          </Pill>
        ) : (
          <Pill tone="success">Handled in {fmtHours((Date.parse(r.resolvedAt!) - Date.parse(r.at)) / 3600_000)}</Pill>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-surface-2 p-3 text-[14.5px]">
        {r.kind === "post" && (post ? <p className="whitespace-pre-wrap">{post.text}</p> : <p className="italic text-muted">Post has been removed.</p>)}
        {r.kind === "job" && job && (
          <>
            <p className="font-semibold">
              {job.title} · {job.company}
            </p>
            <p className="mt-1 line-clamp-2 text-muted">
              <MaskedText text={job.description} />
            </p>
            <p className="mt-1.5 text-[13px] text-muted">
              Status: {job.status} · {job.interested.length} interested ·{" "}
              <Link href="/portal/admin/content" className="font-semibold text-primary hover:underline">
                Open in Jobs &amp; events
              </Link>
            </p>
          </>
        )}
        {r.kind === "profile" && subject && (
          <p>
            Profile of <b>{subject.name}</b>: {subject.title ?? "—"} {subject.company ? `at ${subject.company}` : ""}, Batch {subject.batch}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-muted">
        {subject && (
          <Link href={`/portal/people/${subject.id}`} className="flex items-center gap-1.5 hover:text-text">
            <Avatar name={subject.name} size={22} /> {subject.name}
            {subject.deactivated && " (deactivated)"}
          </Link>
        )}
        <span>
          Reported by {reporter?.name ?? "system"} · {timeAgo(r.at)}
        </span>
        <span>{campusName(r.campusId)}</span>
      </div>

      {r.status === "open" ? (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          {allowed ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => onAct("dismiss")}>
                Dismiss
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onAct("warn")}>
                Warn member
              </Button>
              <Button size="sm" variant="danger" onClick={() => onAct("remove")}>
                {removeLabel}
              </Button>
            </>
          ) : (
            <NoPermission what="moderate content" />
          )}
        </div>
      ) : (
        <p className="mt-3 border-t border-border pt-3 text-[14px]">
          <b>Outcome:</b> {r.resolution} · by {state.users.find((u) => u.id === r.resolvedBy)?.name}
        </p>
      )}
    </Card>
  );
}
