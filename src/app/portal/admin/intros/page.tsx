"use client";

import { useState } from "react";
import { Handshake } from "lucide-react";
import { AdminOnly, useScope } from "@/components/admin";
import { Avatar, Button, Callout, Card, Empty, Field, Modal, PageHeader, Pill, Req, Stat, Tabs, Textarea } from "@/components/ui";
import { campusName } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { GuideIntro } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export default function IntrosPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <Intros />
    </AdminOnly>
  );
}

/** F6 / MCZ-10: MyCareerZ counsellors ask the guide's campus alumni office for an introduction. */
function Intros() {
  const { me, state, handleGuideIntro } = useStore();
  const { inScope } = useScope();
  const [tab, setTab] = useState<"open" | "done">("open");
  const [acting, setActing] = useState<{ r: GuideIntro; status: "introduced" | "declined" } | null>(null);
  const [reply, setReply] = useState("");
  const [err, setErr] = useState("");
  if (!me) return null;

  const all = state.guideIntros.filter((r) => inScope(r.campusId));
  const open = all.filter((r) => r.status === "requested");
  const done = all.filter((r) => r.status !== "requested");
  const list = tab === "open" ? open : done;
  const u = (id?: string) => state.users.find((x) => x.id === id);

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="F6 · MCZ-10 · cond. 4" />}
        title="Guide introductions"
        description="MyCareerZ counsellors asking to be introduced to your opted-in alumni guides. Check with the alumnus first, then introduce or decline. Counsellors never get alumni contact details from the platform."
      />
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Waiting" value={open.length} tone={open.length ? "warning" : "success"} />
        <Stat label="Introduced" value={all.filter((r) => r.status === "introduced").length} />
        <Stat label="Declined" value={all.filter((r) => r.status === "declined").length} />
      </div>
      <div className="mb-4">
        <Tabs
          tabs={[
            { id: "open", label: "Waiting", count: open.length },
            { id: "done", label: "Handled", count: done.length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {list.length === 0 ? (
        <Card>
          <Empty icon={<Handshake className="h-6 w-6" />} title={tab === "open" ? "Nothing waiting" : "Nothing handled yet"}>
            Requests appear here when a MyCareerZ counsellor asks to meet one of your campus&apos;s alumni guides.
          </Empty>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const g = u(r.guideId);
            const c = u(r.counsellorId);
            const s = u(r.studentId);
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <Avatar name={g?.name ?? "?"} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {g?.name} <span className="font-normal text-muted">· Batch {g?.batch} · {campusName(r.campusId)}</span>
                    </p>
                    <p className="text-sm text-muted">{[g?.course, g?.college, g?.country].filter(Boolean).join(" · ")}</p>
                    <p className="mt-2 text-sm">
                      Asked by <b>{c?.name}</b> (MyCareerZ){s ? <> for <b>{s.name}</b>, Class {s.className}</> : null} · {timeAgo(r.at)}
                    </p>
                    <p className="mt-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">&ldquo;{r.reason}&rdquo;</p>
                    {!g?.mczGuide && r.status === "requested" && <p className="mt-2 text-label font-semibold text-danger">This alumnus has since switched off being a guide. Decline the request.</p>}
                    {r.status !== "requested" && (
                      <p className="mt-2 text-label text-muted">
                        {r.status === "introduced" ? "Introduced" : "Declined"} by {u(r.handledBy)?.name} · {timeAgo(r.handledAt ?? r.at)}
                        {r.reply ? ` · “${r.reply}”` : ""}
                      </p>
                    )}
                  </div>
                  {r.status === "requested" ? (
                    <div className="flex flex-col items-end gap-2">
                      <Button size="sm" disabled={!g?.mczGuide} onClick={() => { setActing({ r, status: "introduced" }); setReply(""); setErr(""); }}>
                        Introduce
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => { setActing({ r, status: "declined" }); setReply(""); setErr(""); }}>
                        Decline
                      </Button>
                    </div>
                  ) : (
                    <Pill tone={r.status === "introduced" ? "success" : "neutral"}>{r.status === "introduced" ? "Introduced" : "Declined"}</Pill>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!acting}
        onClose={() => setActing(null)}
        title={acting ? `${acting.status === "introduced" ? "Introduce" : "Decline"}: ${u(acting.r.guideId)?.name}` : ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setActing(null)}>
              Cancel
            </Button>
            <Button
              variant={acting?.status === "declined" ? "danger" : "primary"}
              onClick={() => {
                if (!acting) return;
                const r = handleGuideIntro(acting.r.id, acting.status, me.id, reply);
                if (r.ok) setActing(null);
                else setErr(r.error ?? "");
              }}
            >
              {acting?.status === "introduced" ? "Send introduction" : "Decline"}
            </Button>
          </>
        }
      >
        {acting && (
          <div className="space-y-4">
            {acting.status === "introduced" ? (
              <Callout tone="info">
                Only introduce once {u(acting.r.guideId)?.name.split(" ")[0]} has agreed. The counsellor and the alumnus both get an email, and this is added to the Engagement log.
              </Callout>
            ) : (
              <Callout tone="warning">The counsellor is told it isn&apos;t possible, with your reason. The alumnus is not contacted.</Callout>
            )}
            <Field
              label={acting.status === "introduced" ? "Message to the counsellor (optional)" : "Reason for the counsellor"}
              htmlFor="intro-reply"
              hint={acting.status === "introduced" ? "e.g. how and when the alumnus prefers to be contacted." : "At least 5 characters."}
            >
              <Textarea
                id="intro-reply"
                rows={3}
                value={reply}
                onChange={(e) => { setReply(e.target.value); setErr(""); }}
                placeholder={acting.status === "introduced" ? "Priya is happy to do a 20-minute video call on weekends. She will email you directly." : "Priya is travelling until January."}
              />
            </Field>
            {err && <p className="text-sm font-semibold text-danger">{err}</p>}
          </div>
        )}
      </Modal>
    </>
  );
}
