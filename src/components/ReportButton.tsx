"use client";

import { useState } from "react";
import { CheckCircle2, Flag } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button, Modal } from "./ui";

const REASONS = ["Spam / selling", "Harassment or hate", "Fake or impersonating profile", "Misleading job details", "Inappropriate content", "Other"];

/** CS-7: "Report" on every profile, post and job */
export function ReportButton({ kind, targetId, compact }: { kind: "post" | "job" | "profile"; targetId: string; compact?: boolean }) {
  const { me, state, reportContent } = useStore();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  if (!me) return null;
  const already = state.reports.some((r) => r.reporterId === me.id && r.status === "open" && (r.postId === targetId || r.jobId === targetId || (kind === "profile" && r.kind === "profile" && r.subjectUserId === targetId)));
  return (
    <>
      <button
        onClick={() => !already && setOpen(true)}
        className={cn("flex items-center gap-2 text-sm font-medium", already ? "text-success" : "text-muted hover:text-danger", !compact && "rounded-xl border border-border px-3 py-2 hover:bg-surface-2")}
        aria-label={`Report this ${kind}`}
      >
        {already ? <CheckCircle2 className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
        {already ? "Reported" : compact ? "" : `Report ${kind}`}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Report this ${kind}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                reportContent(kind, targetId, me.id, reason);
                setOpen(false);
              }}
            >
              Send report
            </Button>
          </>
        }
      >
        <p className="mb-3 text-body text-muted">The campus alumni office reviews every report. The person won&apos;t see who reported them.</p>
        <div className="space-y-2">
          {REASONS.map((r) => (
            <label key={r} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-body", reason === r ? "border-primary bg-primary-soft/50" : "border-border hover:bg-surface-2")}>
              <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-[var(--primary)]" />
              {r}
            </label>
          ))}
        </div>
      </Modal>
    </>
  );
}
