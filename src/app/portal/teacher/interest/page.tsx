"use client";

import { useState } from "react";
import { Gate } from "@/components/Gate";
import { Avatar, Button, Card, Empty, Modal, PageHeader, Pill, Req, Select, Tabs, Textarea } from "@/components/ui";
import { campusName } from "@/lib/data";
import { hasConsent, useStore } from "@/lib/store";
import type { InterestStatus } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const label: Record<InterestStatus, string> = { new: "New", checking: "Checking with parent", passed_on: "Passed on", declined: "Declined" };
const tone: Record<InterestStatus, "warning" | "info" | "success" | "neutral"> = { new: "warning", checking: "info", passed_on: "success", declined: "neutral" };

export default function TeacherInterestPage() {
  return (
    <Gate roles={["TCH"]}>
      <Inbox />
    </Gate>
  );
}

function Inbox() {
  const { me, state, setInterestStatus } = useStore();
  const [tab, setTab] = useState<"open" | "done">("open");
  const [edit, setEdit] = useState<{ jobId: string; studentId: string } | null>(null);
  const [status, setStatus] = useState<InterestStatus>("checking");
  const [note, setNote] = useState("");
  if (!me) return null;

  const rows = state.jobs
    .flatMap((j) =>
      j.interested.map((i) => ({ j, i, stu: state.users.find((u) => u.id === i.userId) }))
    )
    .filter((r) => r.stu?.role === "STU" && me.campusIds.includes(r.stu.campusIds[0]))
    .map((r) => ({ ...r, st: (r.i.counsellor?.status ?? "new") as InterestStatus }))
    .sort((a, b) => b.i.at.localeCompare(a.i.at));
  const open = rows.filter((r) => r.st === "new" || r.st === "checking");
  const done = rows.filter((r) => r.st === "passed_on" || r.st === "declined");
  const list = tab === "open" ? open : done;
  const cur = edit && rows.find((r) => r.j.id === edit.jobId && r.i.userId === edit.studentId);

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="E5 · CS-3" />}
        title="Student interest"
        description={`Students at ${campusName(me.campusIds[0])} who pressed "I'm interested" on an internship. Check with the parent before passing anything on.`}
      />
      <div className="mb-5">
        <Tabs
          tabs={[
            { id: "open", label: "To handle", count: open.length },
            { id: "done", label: "Done", count: done.length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {list.length === 0 ? (
        <Card>
          <Empty title={tab === "open" ? "Nothing waiting" : "Nothing handled yet"}>When a student shows interest in an internship, it appears here and you get an email.</Empty>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map(({ j, i, stu, st }) => {
            const parents = (stu!.parentIds ?? []).map((id) => state.users.find((u) => u.id === id)?.name).filter(Boolean);
            return (
              <Card key={j.id + i.userId} className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <Avatar name={stu!.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {stu!.name} <span className="font-normal text-muted">· Class {stu!.className}</span>
                    </p>
                    <p className="text-sm">
                      {j.title} · {j.company} <span className="text-muted">· {timeAgo(i.at)}</span>
                    </p>
                    {i.note && <p className="mt-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">&ldquo;{i.note}&rdquo;</p>}
                    <p className="mt-2 text-label text-muted">
                      Parent{parents.length > 1 ? "s" : ""}: {parents.join(" and ") || "—"} · Platform consent {hasConsent(state, stu!.id, "platform") ? "given" : "missing"}
                    </p>
                    {i.counsellor?.note && <p className="mt-1 text-label text-muted">Your note: {i.counsellor.note}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Pill tone={tone[st]}>{label[st]}</Pill>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEdit({ jobId: j.id, studentId: i.userId });
                        setStatus(st === "new" ? "checking" : st);
                        setNote(i.counsellor?.note ?? "");
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!cur}
        onClose={() => setEdit(null)}
        title={cur ? `${cur.stu!.name} · ${cur.j.title}` : ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (cur) setInterestStatus(cur.j.id, cur.i.userId, status, note, me.id);
                setEdit(null);
              }}
            >
              Save and tell the student
            </Button>
          </>
        }
      >
        <label className="block text-sm font-semibold" htmlFor="int-status">
          Status
        </label>
        <Select id="int-status" className="mt-2" value={status} onChange={(e) => setStatus(e.target.value as InterestStatus)}>
          <option value="checking">Checking with parent</option>
          <option value="passed_on">Passed on to the company</option>
          <option value="declined">Not taking it forward</option>
        </Select>
        <label className="mt-4 block text-sm font-semibold" htmlFor="int-note">
          Note (shared with the student{status === "passed_on" || status === "declined" ? " and parents" : ""})
        </label>
        <Textarea id="int-note" className="mt-2" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Spoke to your mother; application sent to the company on Monday." />
        <p className="mt-2 text-label text-muted">The student gets a notification. Parents get a WhatsApp when it&apos;s passed on or declined.</p>
      </Modal>
    </>
  );
}
