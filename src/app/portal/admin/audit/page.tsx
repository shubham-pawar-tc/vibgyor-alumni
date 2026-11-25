"use client";

import { useState } from "react";
import { Download, Search } from "lucide-react";
import { Button, Card, Field, Input, Modal, PageHeader, Pill, Req, Select, Textarea } from "@/components/ui";
import { AdminOnly, useScope } from "@/components/admin";
import { campusName } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { AuditEntry } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const catTone: Record<AuditEntry["category"], "primary" | "success" | "warning" | "danger" | "info" | "neutral"> = {
  consent: "success",
  safeguarding: "danger",
  verification: "primary",
  broadcast: "info",
  data_access: "warning",
  auth: "neutral",
  admin: "neutral",
  community: "primary",
};

function Inner() {
  const { me, state, log } = useStore();
  const { inScope } = useScope();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [exportOpen, setExportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [exported, setExported] = useState(false);

  const rows = state.audit
    .filter((a) => !a.campusId || inScope(a.campusId))
    .filter((a) => cat === "all" || a.category === cat)
    .filter((a) => !q || `${a.action} ${a.target} ${a.detail ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  const actor = (id: string) => (id === "system" ? "System" : state.users.find((u) => u.id === id)?.name ?? id);

  return (
    <>
      <PageHeader
        eyebrow={<div className="flex gap-1.5"><Req ids="A12" /> <Req ids="CS-16" /> <Req ids="L3" /> <Req ids="NFR-10" /></div>}
        title="Audit log"
        description="Every admin, consent, safeguarding and data-access action: who, what, when and why. Entries can't be edited."
        actions={
          <Button variant="secondary" onClick={() => { setExportOpen(true); setExported(false); setReason(""); }}>
            <Download className="h-4 w-4" /> Export
          </Button>
        }
      />
      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actions, people, details" className="pl-10" aria-label="Search audit log" />
          </div>
          <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
            <option value="all">All categories</option>
            <option value="consent">Consent</option>
            <option value="safeguarding">Safeguarding</option>
            <option value="verification">Verification</option>
            <option value="broadcast">Broadcast</option>
            <option value="data_access">Data access</option>
            <option value="community">Community</option>
            <option value="auth">Sign-in</option>
            <option value="admin">Settings</option>
          </Select>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[12px] text-muted">
                <th className="px-5 py-3 font-semibold">When</th>
                <th className="px-3 py-3 font-semibold">Who</th>
                <th className="px-3 py-3 font-semibold">Action</th>
                <th className="px-3 py-3 font-semibold">Subject</th>
                <th className="px-5 py-3 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((a) => (
                <tr key={a.id} className="align-top hover:bg-surface-2/50">
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-[12px] text-muted">{formatDateTime(a.at)}</td>
                  <td className="px-3 py-3 font-medium">{actor(a.actorId)}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-medium">{a.action}</span>
                      <Pill tone={catTone[a.category]} className="!text-[10.5px]">{a.category.replace("_", " ")}</Pill>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {a.target}
                    {a.campusId && <p className="text-[12px] text-muted">{campusName(a.campusId).split(",")[0]}</p>}
                  </td>
                  <td className="px-5 py-3 text-muted">{a.detail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No entries match.</p>}
      </Card>

      <Modal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export audit log"
        footer={
          exported ? (
            <Button onClick={() => setExportOpen(false)}>Done</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setExportOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={reason.trim().length < 5}
                onClick={() => {
                  log({ actorId: me!.id, action: "Exported report", target: "Audit log", campusId: me!.campusIds.length === 1 ? me!.campusIds[0] : undefined, category: "data_access", detail: `Reason: ${reason.trim()}` });
                  setExported(true);
                }}
              >
                <Download className="h-4 w-4" /> Export to Excel
              </Button>
            </>
          )
        }
      >
        {exported ? (
          <p className="text-[14px]">Export prepared ({rows.length} rows). The export itself has been added to the audit log with your reason.</p>
        ) : (
          <Field label="Reason to share (required)" htmlFor="reason" hint="Recorded in the audit log with the export.">
            <Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Quarterly safeguarding review with the principal" />
          </Field>
        )}
      </Modal>
    </>
  );
}

export default function AuditPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <Inner />
    </AdminOnly>
  );
}
