"use client";

import { useState } from "react";
import { CheckCircle2, Download, FileLock2 } from "lucide-react";
import { AdminOnly, NoPermission, useScope } from "@/components/admin";
import { statusPill } from "@/components/MyData";
import { Avatar, Button, Callout, Card, Empty, Field, Modal, PageHeader, Pill, Req, Stat, Tabs, Textarea } from "@/components/ui";
import { campusName, REQUEST_DAYS, roleLabels } from "@/lib/data";
import { buildDataText, download } from "@/lib/admin";
import { can, useStore } from "@/lib/store";
import type { DataRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const typeLabel: Record<DataRequest["type"], string> = { access: "Copy of data", correction: "Correction", deletion: "Deletion", complaint: "Privacy complaint" };

export default function RequestsPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <Requests />
    </AdminOnly>
  );
}

function daysLeft(due: string) {
  return Math.ceil((Date.parse(due) - Date.now()) / 86400_000);
}

function Requests() {
  const { me, state, updateDataRequest } = useStore();
  const { inScope } = useScope();
  const [tab, setTab] = useState<"open" | "closed">("open");
  const [closing, setClosing] = useState<{ r: DataRequest; status: "done" | "rejected" } | null>(null);
  const [note, setNote] = useState("");
  if (!me) return null;
  const all = state.dataRequests.filter((r) => inScope(r.campusId));
  const open = all.filter((r) => r.status === "open" || r.status === "in_progress").sort((a, b) => Date.parse(a.due) - Date.parse(b.due));
  const closed = all.filter((r) => r.status === "done" || r.status === "rejected");
  const allowed = can(state, me, "requests.handle");
  const list = tab === "open" ? open : closed;

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="A11 · CS-11 · CS-15" />}
        title="Data & privacy requests"
        description={`Requests from alumni and parents to see, correct or delete data, and privacy complaints. Each one must be answered within ${REQUEST_DAYS} days [TBC: VIBGYOR to confirm against the DPDP Rules].`}
      />
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Open" value={open.length} />
        <Stat label="Due within 7 days" value={open.filter((r) => daysLeft(r.due) <= 7).length} tone={open.some((r) => daysLeft(r.due) <= 7) ? "warning" : "success"} />
        <Stat label="Closed" value={closed.length} />
      </div>
      <div className="mb-4">
        <Tabs
          tabs={[
            { id: "open", label: "Open", count: open.length },
            { id: "closed", label: "Closed", count: closed.length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {list.length === 0 ? (
        <Card>
          <Empty icon={<CheckCircle2 className="h-6 w-6" />} title="No requests here" />
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const subject = state.users.find((u) => u.id === r.subjectId);
            const requester = state.users.find((u) => u.id === r.requesterId);
            const left = daysLeft(r.due);
            const isOpen = r.status === "open" || r.status === "in_progress";
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary">
                    <FileLock2 className="h-4 w-4" />
                  </span>
                  <p className="text-[14.5px] font-semibold">{typeLabel[r.type]}</p>
                  {statusPill[r.status]}
                  <span className="flex-1" />
                  {isOpen && (
                    <Pill tone={left < 0 ? "danger" : left <= 7 ? "warning" : "neutral"}>
                      {left < 0 ? `${-left} days overdue` : `Due ${formatDate(r.due)} · ${left} days left`}
                    </Pill>
                  )}
                </div>
                <p className="mt-3 rounded-xl bg-surface-2 p-3 text-[14.5px]">&ldquo;{r.details}&rdquo;</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <Avatar name={subject?.name ?? "?"} size={22} /> About {subject?.name} ({subject && roleLabels[subject.role]})
                  </span>
                  {requester && requester.id !== r.subjectId && <span>Requested by {requester.name}, {roleLabels[requester.role].toLowerCase()}</span>}
                  <span>Received {formatDate(r.at)}</span>
                  <span>{campusName(r.campusId)}</span>
                </div>
                {r.resolution && (
                  <p className="mt-3 text-[14px]">
                    <b>Response:</b> {r.resolution}
                  </p>
                )}
                {isOpen && (
                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                    {!allowed ? (
                      <NoPermission what="handle data requests" />
                    ) : (
                      <>
                        {r.status === "open" && (
                          <Button size="sm" variant="ghost" onClick={() => updateDataRequest(r.id, "in_progress", me.id)}>
                            Start working on it
                          </Button>
                        )}
                        {r.type === "access" && (
                          <Button size="sm" variant="secondary" onClick={() => download(`data-${r.subjectId}.txt`, buildDataText(state, r.subjectId), "text/plain;charset=utf-8")}>
                            <Download className="h-4 w-4" /> Prepare data file
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setClosing({ r, status: "rejected" });
                            setNote("");
                          }}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          variant={r.type === "deletion" ? "danger" : "primary"}
                          onClick={() => {
                            setClosing({ r, status: "done" });
                            setNote(r.type === "access" ? "Your data file has been sent to your registered email over a secure link." : r.type === "deletion" ? "Your account and personal details have been deleted." : "");
                          }}
                        >
                          {r.type === "deletion" ? "Delete & close" : "Mark done"}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!closing}
        onClose={() => setClosing(null)}
        title={closing?.status === "rejected" ? "Decline request" : closing?.r.type === "deletion" ? "Delete this person's data?" : "Close request"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setClosing(null)}>
              Cancel
            </Button>
            <Button
              variant={closing?.r.type === "deletion" && closing.status === "done" ? "danger" : "primary"}
              disabled={note.trim().length < 5}
              onClick={() => {
                if (closing) updateDataRequest(closing.r.id, closing.status, me.id, note.trim());
                setClosing(null);
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {closing?.r.type === "deletion" && closing.status === "done" && (
            <Callout tone="danger">
              Name, email, mobile, work, education and profile details are removed and the account is switched off. This can&apos;t be undone. Consent and audit records stay for their legal retention period.
            </Callout>
          )}
          <Field label="Reply to the person" htmlFor="cn" hint="Sent by email and kept with the request">
            <Textarea id="cn" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </>
  );
}
