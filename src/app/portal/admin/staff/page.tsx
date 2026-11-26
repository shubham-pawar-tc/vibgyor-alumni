"use client";

import { useState } from "react";
import { Pencil, Plus, ShieldCheck, UserX } from "lucide-react";
import { Gate } from "@/components/Gate";
import { Avatar, Button, Callout, Card, Input, Modal, PageHeader, Pill, Req, Select } from "@/components/ui";
import { campuses, campusName, roleLabels } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { Role, User } from "@/lib/types";

const STAFF: Role[] = ["TCH", "CAD", "GAO", "FIN", "MCZ", "SAD"];
type Draft = { id?: string; name: string; email: string; mobile: string; role: Role; campusIds: string[] };

export default function StaffPage() {
  return (
    <Gate roles={["SAD"]} why="Only the Super Admin manages staff accounts and campus scopes.">
      <Staff />
    </Gate>
  );
}

function scopeText(u: { role: Role; campusIds: string[] }) {
  if (u.role === "GAO" || u.role === "SAD" || u.campusIds.length === campuses.length) return "All campuses";
  if (u.campusIds.length <= 2) return u.campusIds.map((c) => campusName(c)).join(", ");
  return `${u.campusIds.length} campuses`;
}

function Staff() {
  const { me, state, saveStaff, resetTwoFactor, setDeactivated } = useStore();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [err, setErr] = useState("");
  const [role, setRole] = useState<"all" | Role>("all");
  if (!me) return null;
  const staff = state.users.filter((u) => STAFF.includes(u.role) && (role === "all" || u.role === role));

  const open = (u?: User) => {
    setErr("");
    setDraft(u ? { id: u.id, name: u.name, email: u.email, mobile: u.mobile, role: u.role, campusIds: [...u.campusIds] } : { name: "", email: "", mobile: "", role: "CAD", campusIds: [campuses[0].id] });
  };
  const multi = draft && (draft.role === "FIN" || draft.role === "MCZ");
  const all = draft && (draft.role === "GAO" || draft.role === "SAD");

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="A6 · CS-16" />}
        title="Staff & scopes"
        description="Create staff accounts and decide which campuses each person can see. Changes take effect at their next page load and are recorded in the audit log."
        actions={
          <Button onClick={() => open()}>
            <Plus className="h-4 w-4" /> Add staff
          </Button>
        }
      />
      <div className="mb-4 max-w-xs">
        <Select value={role} onChange={(e) => setRole(e.target.value as Role | "all")} aria-label="Filter by role">
          <option value="all">All staff roles</option>
          {STAFF.map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
            </option>
          ))}
        </Select>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-[14px]">
          <thead className="border-b border-border text-left text-[13px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Person</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Campus scope</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size={32} />
                    <div>
                      <p className="font-semibold">
                        {u.name} {u.id === me.id && <span className="text-muted">(you)</span>}
                      </p>
                      <p className="text-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{roleLabels[u.role]}</td>
                <td className="px-4 py-3">{scopeText(u)}</td>
                <td className="px-4 py-3">{u.deactivated ? <Pill tone="neutral">Switched off</Pill> : <Pill tone="success">Active</Pill>}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => open(u)} aria-label={`Edit ${u.name}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => resetTwoFactor(u.id, me.id)} aria-label={`Reset 2-factor for ${u.name}`} title="Reset 2-factor sign-in">
                      <ShieldCheck className="h-4 w-4" />
                    </Button>
                    {u.id !== me.id && (
                      <Button size="sm" variant="secondary" onClick={() => setDeactivated(u.id, !u.deactivated, me.id)} title={u.deactivated ? "Switch on" : "Switch off"} aria-label={u.deactivated ? `Switch on ${u.name}` : `Switch off ${u.name}`}>
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? `Edit ${draft.name}` : "Add staff"}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!draft) return;
                const r = saveStaff(draft, me.id);
                if (r.ok) setDraft(null);
                else setErr(r.error ?? "Couldn't save.");
              }}
            >
              {draft?.id ? "Save changes" : "Create and send sign-in email"}
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Full name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} aria-label="Full name" />
              <Input placeholder="Work email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} aria-label="Work email" />
              <Input placeholder="Mobile (+91 …)" value={draft.mobile} onChange={(e) => setDraft({ ...draft, mobile: e.target.value })} aria-label="Mobile" />
              <Select
                value={draft.role}
                aria-label="Role"
                onChange={(e) => {
                  const r = e.target.value as Role;
                  setDraft({ ...draft, role: r, campusIds: r === "TCH" || r === "CAD" ? [draft.campusIds[0] ?? campuses[0].id] : draft.campusIds });
                }}
              >
                {STAFF.map((r) => (
                  <option key={r} value={r}>
                    {roleLabels[r]}
                  </option>
                ))}
              </Select>
            </div>
            {all ? (
              <Callout tone="info">{roleLabels[draft.role]} always sees all {campuses.length} campuses.</Callout>
            ) : multi ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[14px] font-semibold">Campuses ({draft.campusIds.length} selected)</p>
                  <div className="flex gap-2 text-[13px]">
                    <button type="button" className="font-semibold text-primary" onClick={() => setDraft({ ...draft, campusIds: campuses.map((c) => c.id) })}>
                      Select all
                    </button>
                    <button type="button" className="font-semibold text-muted" onClick={() => setDraft({ ...draft, campusIds: [] })}>
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid max-h-64 grid-cols-1 gap-1 overflow-y-auto rounded-xl border border-border p-2 sm:grid-cols-2">
                  {campuses.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[14px] hover:bg-surface-2">
                      <input
                        type="checkbox"
                        checked={draft.campusIds.includes(c.id)}
                        onChange={(e) => setDraft({ ...draft, campusIds: e.target.checked ? [...draft.campusIds, c.id] : draft.campusIds.filter((x) => x !== c.id) })}
                      />
                      {c.name} <span className="text-muted">· {c.city}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <Select value={draft.campusIds[0]} onChange={(e) => setDraft({ ...draft, campusIds: [e.target.value] })} aria-label="Campus">
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.city}
                  </option>
                ))}
              </Select>
            )}
            {!draft.id && <p className="text-[13px] text-muted">They get an email with a sign-in link. Sign-in is one-time code plus 2-factor; no password is sent.</p>}
            {err && <p className="text-[14px] font-semibold text-danger">{err}</p>}
          </div>
        )}
      </Modal>
    </>
  );
}
