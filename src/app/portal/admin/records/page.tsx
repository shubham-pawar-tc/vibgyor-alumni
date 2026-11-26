"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Download, Mail, MessageCircle, Pencil, Power, Search, Send, Smartphone } from "lucide-react";
import { AdminOnly, NoPermission, useScope } from "@/components/admin";
import { Avatar, Button, Callout, Card, Checkbox, Field, Input, Modal, PageHeader, Pill, Req, Select, Textarea } from "@/components/ui";
import { campuses, campusName } from "@/lib/data";
import { download, exportFields, exportValue, toCsv } from "@/lib/admin";
import { completeness } from "@/lib/community";
import { can, LOGIN_INVITE_TEMPLATE, loginInviteBody, useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

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
  const [selected, setSelected] = useState<string[]>([]);
  const [inviting, setInviting] = useState<User[] | null>(null);
  if (!me) return null;

  const n = q.trim().toLowerCase();
  const rows = state.users
    .filter((u) => (u.role === "ALU" || u.role === "ALP") && inScope(u.campusIds[0]))
    .filter((u) => campus === "all" || u.campusIds[0] === campus)
    .filter((u) => status === "all" || (status === "off" ? u.deactivated : !u.deactivated && (status === "verified" ? u.role === "ALU" : u.role === "ALP")))
    .filter((u) => !n || `${u.name} ${u.email} ${u.company ?? ""}`.toLowerCase().includes(n))
    .sort((a, b) => a.name.localeCompare(b.name));
  const canView = can(state, me, "records.view");
  const canEdit = can(state, me, "records.edit");
  const canExport = can(state, me, "records.export");
  const sendable = rows.filter((u) => !u.deactivated);
  const selectedRows = sendable.filter((u) => selected.includes(u.id));
  const allOn = sendable.length > 0 && sendable.every((u) => selected.includes(u.id));

  if (!canView)
    return (
      <Card className="p-6">
        <NoPermission what="view alumni records" />
      </Card>
    );

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="L1 · L3 · CS-14" />}
        title="Alumni records"
        description={group ? "Every alumni record across the 39 campuses." : `Alumni records for ${campusName(me.campusIds[0])}.`}
        actions={
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Button
                disabled={!selectedRows.length}
                onClick={() => setInviting(selectedRows)}
                title={selectedRows.length ? undefined : "Tick people in the list first"}
              >
                <Send className="h-4 w-4" /> Send login link{selectedRows.length ? ` (${selectedRows.length})` : ""}
              </Button>
            )}
            {canExport ? (
              <Button variant="secondary" onClick={() => setExporting(true)}>
                <Download className="h-4 w-4" /> Export {rows.length}
              </Button>
            ) : (
              <NoPermission what="export data" />
            )}
          </div>
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
              {canEdit && (
                <th className="w-10 py-3 pl-4">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allOn}
                    onChange={(e) => setSelected(e.target.checked ? sendable.map((u) => u.id) : [])}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                </th>
              )}
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
                <tr key={u.id} className={cn(u.deactivated && "opacity-55", selected.includes(u.id) && "bg-primary-soft/40")}>
                  {canEdit && (
                    <td className="py-3 pl-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${u.name}`}
                        disabled={u.deactivated}
                        checked={selected.includes(u.id)}
                        onChange={(e) => setSelected(e.target.checked ? [...selected, u.id] : selected.filter((x) => x !== u.id))}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                    </td>
                  )}
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
                  <td className="px-4 py-3">
                    {u.deactivated ? <Pill tone="danger">Deactivated</Pill> : u.role === "ALU" ? <Pill tone="success">Verified</Pill> : <Pill tone="warning">Pending</Pill>}
                    {u.loginInviteAt && (
                      <span className="mt-1 block text-[12px] text-muted" title={`${u.loginInviteCount ?? 1} login link(s) sent`}>
                        Link sent {timeAgo(u.loginInviteAt)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {canEdit && (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setInviting([u])}
                          disabled={u.deactivated}
                          className="grid h-8 w-8 place-items-center rounded-xl text-primary hover:bg-surface-2 disabled:opacity-30"
                          aria-label={`Send login link to ${u.name}`}
                          title="Send login link"
                        >
                          <Send className="h-4 w-4" />
                        </button>
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
      {inviting && (
        <InviteModal
          people={inviting}
          onClose={(sent) => {
            setInviting(null);
            if (sent) setSelected([]);
          }}
        />
      )}
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

type InviteChannel = "email" | "whatsapp" | "sms";

/** Onboarding message with a personal login link and sign-in steps. No passwords: sign-in is a one-time code. */
function InviteModal({ people, onClose }: { people: User[]; onClose: (sent: boolean) => void }) {
  const { me, sendLoginInvites } = useStore();
  const [channels, setChannels] = useState<InviteChannel[]>(["email", "whatsapp"]);
  const [template, setTemplate] = useState(LOGIN_INVITE_TEMPLATE);
  const [result, setResult] = useState<{ sent: number; skipped: number } | null>(null);
  const sample = people[0];
  const noMobile = people.filter((u) => !/\d{6,}/.test(u.mobile.replace(/\D/g, ""))).length;
  const already = people.filter((u) => u.loginInviteAt).length;
  const toggle = (c: InviteChannel) => setChannels(channels.includes(c) ? channels.filter((x) => x !== c) : [...channels, c]);
  const opts: [InviteChannel, string, typeof Mail][] = [
    ["email", "Email", Mail],
    ["whatsapp", "WhatsApp", MessageCircle],
    ["sms", "SMS", Smartphone],
  ];

  if (result)
    return (
      <Modal open onClose={() => onClose(true)} title="Login links sent" footer={<Button onClick={() => onClose(true)}>Done</Button>}>
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <p className="mt-3 font-semibold">
            Sent to {result.sent} {result.sent === 1 ? "person" : "people"}
          </p>
          {result.skipped > 0 && <p className="mt-1 text-[14px] text-muted">{result.skipped} skipped (deactivated, or no contact for the chosen channels)</p>}
          <p className="mt-3 text-[13px] text-muted">Demo: open the device simulator to see the messages. Recorded in the audit log.</p>
        </div>
      </Modal>
    );

  return (
    <Modal
      open
      wide
      onClose={() => onClose(false)}
      title={people.length === 1 ? `Send login link to ${people[0].name}` : `Send login link to ${people.length} people`}
      footer={
        <>
          <Button variant="secondary" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button disabled={!channels.length || !template.includes("{{login_link}}")} onClick={() => setResult(sendLoginInvites(people.map((u) => u.id), channels, template, me!.id))}>
            <Send className="h-4 w-4" /> Send {people.length > 1 ? `to ${people.length}` : ""}
          </Button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[14px] font-semibold">Send by</p>
            <div className="flex gap-2">
              {opts.map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  className={cn(
                    "flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-[14px] font-semibold",
                    channels.includes(id) ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-surface-2"
                  )}
                  aria-pressed={channels.includes(id)}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
            {noMobile > 0 && channels.some((c) => c !== "email") && (
              <p className="mt-2 text-[13px] text-muted">{noMobile} without a mobile number will get email only.</p>
            )}
          </div>
          <Field label="Message" htmlFor="tpl" hint="Placeholders: {{first_name}}, {{login_id}}, {{login_link}}, {{campus}}, {{batch}}. {{login_link}} is required.">
            <Textarea id="tpl" rows={12} value={template} onChange={(e) => setTemplate(e.target.value)} className="font-mono text-[13px]" />
          </Field>
          {template !== LOGIN_INVITE_TEMPLATE && (
            <button className="text-[13px] font-semibold text-primary" onClick={() => setTemplate(LOGIN_INVITE_TEMPLATE)}>
              Reset to default message
            </button>
          )}
        </div>
        <div className="space-y-3">
          <p className="text-[14px] font-semibold">Preview for {sample.name}</p>
          <div className="whitespace-pre-wrap rounded-xl border border-border bg-surface-2 p-4 text-[14px] leading-relaxed">{loginInviteBody(template, sample)}</div>
          <Callout tone="safe" title="No passwords are sent">
            Everyone signs in with their registered email or mobile and a one-time code. The link fills in their login ID; it doesn&apos;t sign them in by itself.
          </Callout>
          {already > 0 && (
            <Callout tone="info">
              {already} of these {already === 1 ? "has" : "have"} already been sent a link. They&apos;ll get it again.
            </Callout>
          )}
          {people.length > 1 && <p className="text-[13px] text-muted">Each person gets their own name, login ID and link.</p>}
        </div>
      </div>
    </Modal>
  );
}
