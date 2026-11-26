"use client";

import { useState } from "react";
import { Download, Eraser, FileLock2, MessageSquareWarning, PenLine } from "lucide-react";
import { REQUEST_DAYS } from "@/lib/data";
import { buildDataExport, download } from "@/lib/admin";
import { useStore } from "@/lib/store";
import type { DataRequest, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button, Card, CardHeader, Field, Modal, Pill, Req, Textarea } from "./ui";

const TYPES: { type: DataRequest["type"]; label: string; icon: typeof PenLine; hint: string }[] = [
  { type: "correction", label: "Correct something", icon: PenLine, hint: "What's wrong and what it should say" },
  { type: "deletion", label: "Delete account", icon: Eraser, hint: "Anything we should know (optional)" },
  { type: "complaint", label: "Privacy complaint", icon: MessageSquareWarning, hint: "What happened" },
];

export const statusPill: Record<DataRequest["status"], React.ReactNode> = {
  open: <Pill tone="warning">Received</Pill>,
  in_progress: <Pill tone="info">In progress</Pill>,
  done: <Pill tone="success">Done</Pill>,
  rejected: <Pill tone="danger">Declined</Pill>,
};

/** Self-service data rights (A11, CS-11, CS-15). `subject` is whose data; for a minor, the parent is `me`. */
export function MyData({ subject }: { subject: User }) {
  const { me, state, submitDataRequest } = useStore();
  const [type, setType] = useState<DataRequest["type"] | null>(null);
  const [details, setDetails] = useState("");
  if (!me) return null;
  const self = me.id === subject.id;
  const mine = state.dataRequests.filter((r) => r.subjectId === subject.id).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const t = TYPES.find((x) => x.type === type);

  return (
    <Card>
      <CardHeader
        title={self ? "Your data" : `${subject.name.split(" ")[0]}'s data`}
        subtitle={`Download it any time. Other requests are answered within ${REQUEST_DAYS} days.`}
        icon={<FileLock2 className="h-5 w-5" />}
        action={<Req ids="A11 · CS-11 · CS-15" />}
      />
      <div className="grid grid-cols-2 gap-2 p-5 sm:grid-cols-4">
        <button
          onClick={() => download(`vaa-data-${subject.name.toLowerCase().replace(/[^a-z]+/g, "-")}.json`, buildDataExport(state, subject.id), "application/json")}
          className="flex flex-col items-start gap-2 rounded-xl border border-border p-3 text-left text-[14px] font-semibold hover:bg-surface-2"
        >
          <Download className="h-4 w-4 text-primary" /> Download data
        </button>
        {TYPES.map((x) => (
          <button
            key={x.type}
            onClick={() => {
              setType(x.type);
              setDetails("");
            }}
            className="flex flex-col items-start gap-2 rounded-xl border border-border p-3 text-left text-[14px] font-semibold hover:bg-surface-2"
          >
            <x.icon className={`h-4 w-4 ${x.type === "deletion" ? "text-danger" : "text-primary"}`} /> {x.label}
          </button>
        ))}
      </div>
      {mine.length > 0 && (
        <div className="divide-y divide-border border-t border-border">
          {mine.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 px-5 py-3 text-[14px]">
              <span className="font-semibold capitalize">{r.type}</span>
              <span className="text-muted">sent {formatDate(r.at)}</span>
              <span className="flex-1" />
              {r.status !== "done" && r.status !== "rejected" && <span className="text-[13px] text-muted">reply by {formatDate(r.due)}</span>}
              {statusPill[r.status]}
              {r.resolution && <p className="w-full text-[13.5px] text-muted">{r.resolution}</p>}
            </div>
          ))}
        </div>
      )}
      <p className="border-t border-border px-5 py-3 text-[13px] text-muted">Grievance officer: [TBC, VIBGYOR to name] · DPDP Act 2023</p>

      <Modal
        open={!!type}
        onClose={() => setType(null)}
        title={t?.label ?? ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setType(null)}>
              Cancel
            </Button>
            <Button
              variant={type === "deletion" ? "danger" : "primary"}
              disabled={type !== "deletion" && details.trim().length < 5}
              onClick={() => {
                submitDataRequest(type!, subject.id, me.id, details.trim() || "Please delete my account and personal data.");
                setType(null);
              }}
            >
              Send request
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {type === "deletion" && (
            <p className="text-[14.5px] text-muted">
              The alumni office will confirm before deleting. Your name and contact details are removed. Records the school must keep by law (such as consent records) are kept until their retention period ends.
            </p>
          )}
          <Field label="Details" htmlFor="drd" hint={t?.hint}>
            <Textarea id="drd" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </Card>
  );
}
