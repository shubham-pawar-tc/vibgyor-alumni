"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Pencil, Power, Search } from "lucide-react";
import { AdminOnly, NoPermission, useScope } from "@/components/admin";
import { Avatar, Button, Callout, Card, Checkbox, Field, Input, Modal, PageHeader, Pill, Req, Select, Textarea } from "@/components/ui";
import { campuses, campusName } from "@/lib/data";
import { download, exportFields, exportValue, toCsv } from "@/lib/admin";
import { completeness } from "@/lib/community";
import { can, useStore } from "@/lib/store";
import type { User } from "@/lib/types";

export default function RecordsPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <Records />
    </AdminOnly>
  );
}

function Records() {
  const { me, state, setDeactivated } = useStore();
  const { inScope, group } = useScope();
  const [q, setQ] = useState("");
  const [campus, setCampus] = useState("all");
  const [status, setStatus] = useState<"all" | "verified" | "pending" | "off">("all");
  const [editing, setEditing] = useState<User | null>(null);
  const [exporting, setExporting] = useState(false);
  if (!me) return null;

  const n = q.trim().toLowerCase();
  const rows = state.users
    .filter((u) => (u.role === "ALU" || u.role === "ALP") && inScope(u.campusIds[0]))
    .filter((u) => campus === "all" || u.campusIds[0] === campus)
    .filter((u) => status === "all" || (status === "off" ? u.deactivated : !u.deactivated && (status === "verified" ? u.role === "ALU" : u.role === "ALP")))
    .filter((u) => !n || `${u.name} ${u.email} ${u.company ?? ""}`.toLowerCase().includes(n))
    .sort((a, b) => a.name.localeCompare(b.name));
  const canEdit = can(state, me, "records.edit");
  const canExport = can(state, me, "records.export");

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="L1 · L3 · CS-14" />}
        title="Alumni records"
        description={group ? "Every alumni record across the 39 campuses." : `Alumni records for ${campusName(me.campusIds[0])}.`}
        actions={
          canExport ? (
            <Button variant="secondary" onClick={() => setExporting(true)}>
              <Download className="h-4 w-4" /> Export {rows.length}
            </Button>
          ) : (
            <NoPermission what="export data" />
          )
        }
      />
      <Card className="mb-4 flex flex-col gap-2 p-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9" placeholder="Search name, email or company" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {group && (
          <Select className="md:w-56" value={campus} onChange={(e) => setCampus(e.target.value)} aria-label="Campus">
            <option value="all">All campuses</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        )}
        <Select className="md:w-44" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status">
          <option value="all">All statuses</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="off">Deactivated</option>
        </Select>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[14px]">
          <thead className="border-b border-border text-left text-[12.5px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Batch · campus</th>
              <th className="px-4 py-3 font-semibold">Work</th>
              <th className="px-4 py-3 font-semibold">Profile</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((u) => {
              const pct = completeness(u);
              return (
                <tr key={u.id} className={u.deactivated ? "opacity-55" : ""}>
                  <td className="px-4 py-3">
                    <Link href={`/portal/people/${u.id}`} className="flex items-center gap-2.5 hover:underline">
                      <Avatar name={u.name} size={30} />
                      <span className="min-w-0">
                        <span className="block font-semibold">{u.name}</span>
                        <span className="block text-[13px] text-muted">{u.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {u.batch} · {campusName(u.campusIds[0])}
                  </td>
                  <td className="px-4 py-3 text-muted">{[u.title, u.company].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="tabular-nums text-muted">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{u.deactivated ? <Pill tone="danger">Deactivated</Pill> : u.role === "ALU" ? <Pill tone="success">Verified</Pill> : <Pill tone="warning">Pending</Pill>}</td>
                  <td className="px-4 py-3">
                    {canEdit && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEditing(u)} className="grid h-8 w-8 place-items-center rounded-xl hover:bg-surface-2" aria-label={`Edit ${u.name}`}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeactivated(u.id, !u.deactivated, me.id)}
                          className={`grid h-8 w-8 place-items-center rounded-xl hover:bg-surface-2 ${u.deactivated ? "text-success" : "text-danger"}`}
                          aria-label={u.deactivated ? `Reactivate ${u.name}` : `Deactivate ${u.name}`}
                          title={u.deactivated ? "Reactivate" : "Deactivate"}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <p className="mt-2 text-[13px] text-muted">{rows.length} records. Deactivated people disappear from the directory, groups and chats, but their history is kept.</p>

      {editing && <EditRecord u={editing} onClose={() => setEditing(null)} />}
      {exporting && <ExportModal rows={rows} onClose={() => setExporting(false)} />}
    </>
  );
}

function EditRecord({ u, onClose }: { u: User; onClose: () => void }) {
  const { me, editUser } = useStore();
  const [f, setF] = useState({ name: u.name, email: u.email, mobile: u.mobile, batch: String(u.batch ?? ""), title: u.title ?? "", company: u.company ?? "", city: u.city ?? "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${u.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const changed = Object.fromEntries(
                Object.entries({ ...f, batch: Number(f.batch) }).filter(([k, v]) => (u as unknown as Record<string, unknown>)[k] !== v && !(v === "" && (u as unknown as Record<string, unknown>)[k] === undefined))
              ) as Partial<User>;
              if (Object.keys(changed).length) editUser(u.id, changed, me!.id);
              onClose();
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Full name" htmlFor="rn"><Input id="rn" value={f.name} onChange={set("name")} /></Field>
        <Field label="Batch" htmlFor="rb"><Input id="rb" inputMode="numeric" value={f.batch} onChange={set("batch")} /></Field>
        <Field label="Email" htmlFor="re"><Input id="re" value={f.email} onChange={set("email")} /></Field>
        <Field label="Mobile" htmlFor="rm"><Input id="rm" value={f.mobile} onChange={set("mobile")} /></Field>
        <Field label="Job title" htmlFor="rt"><Input id="rt" value={f.title} onChange={set("title")} /></Field>
        <Field label="Company" htmlFor="rc"><Input id="rc" value={f.company} onChange={set("company")} /></Field>
        <Field label="City" htmlFor="rci"><Input id="rci" value={f.city} onChange={set("city")} /></Field>
      </div>
      <p className="mt-3 text-[13px] text-muted">The change and the fields you edited go into the audit log.</p>
    </Modal>
  );
}

function ExportModal({ rows, onClose }: { rows: User[]; onClose: () => void }) {
  const { me, logExport } = useStore();
  const [fields, setFields] = useState<string[]>(["name", "batch", "campus", "email", "company", "city"]);
  const [reason, setReason] = useState("");
  const hiddenCount = rows.filter((u) => exportFields.some((f) => fields.includes(f.key) && "privacy" in f && u.profile?.privacy[f.privacy] === "private")).length;
  return (
    <Modal
      open
      onClose={onClose}
      title={`Export ${rows.length} records`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={reason.trim().length < 8 || !fields.length}
            onClick={() => {
              const cols = exportFields.filter((f) => fields.includes(f.key));
              download(`vaa-alumni-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([cols.map((c) => c.label), ...rows.map((u) => cols.map((c) => exportValue(u, c, campusName)))]));
              logExport(me!.id, `${rows.length} alumni records (${cols.map((c) => c.label).join(", ")})`, reason.trim(), me!.campusIds.length === 1 ? me!.campusIds[0] : undefined);
              onClose();
            }}
          >
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[14px] font-semibold">Columns</p>
          <div className="grid grid-cols-2 gap-2">
            {exportFields.map((f) => (
              <Checkbox key={f.key} checked={fields.includes(f.key)} onChange={(v) => setFields(v ? [...fields, f.key] : fields.filter((x) => x !== f.key))} label={f.label} />
            ))}
          </div>
        </div>
        {hiddenCount > 0 && (
          <Callout tone="info">
            {hiddenCount} {hiddenCount === 1 ? "person has" : "people have"} set some of these fields to &quot;Only me&quot;. Those cells will say &quot;(hidden by member)&quot;.
          </Callout>
        )}
        <Field label="Why are you exporting this?" htmlFor="why" hint="Required. Saved in the audit log with your name.">
          <Textarea id="why" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Guest list for the Malad reunion, shared with the events team" />
        </Field>
      </div>
    </Modal>
  );
}
