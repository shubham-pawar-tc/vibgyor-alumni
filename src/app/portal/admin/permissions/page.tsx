"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { AdminOnly } from "@/components/admin";
import { Callout, Card, CardHeader, Empty, PageHeader, Pill, Req } from "@/components/ui";
import { capabilityLabels, roleLabels } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { Capability, Role } from "@/lib/types";

const ROLES: Role[] = ["TCH", "CAD", "GAO", "FIN", "MCZ", "SAD"];
const LIVE: Capability[] = ["records.export", "records.edit", "duplicates.merge", "masters.edit", "requests.handle", "content.moderate", "engagement.log"];
const FIXED = [
  "Students see and contact only Mentor-badged alumni (CS-4)",
  "Contact details are masked in student chats (CS-6)",
  "Student chats can't be deleted by anyone (CS-5)",
  "Every staff view or export of student data is logged (CS-16)",
  "Staff accounts always use 2-factor login (A13)",
  "Campus Admins only see their own campus (A6)",
];

export default function PermissionsPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      {me?.role === "SAD" ? (
        <Permissions />
      ) : (
        <Card>
          <Empty icon={<Lock className="h-6 w-6" />} title="Super Admin only">
            Switch role to Rahul Menon to edit permissions.
          </Empty>
        </Card>
      )}
    </AdminOnly>
  );
}

function Permissions() {
  const { me, state, setPermission } = useStore();
  if (!me) return null;
  return (
    <>
      <PageHeader eyebrow={<Req ids="A6" />} title="Permissions" description="What each staff role can do. Changes apply immediately and are written to the audit log." />
      <Card className="mb-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-[13px]">
          <thead className="border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-muted">Can…</th>
              {ROLES.map((r) => (
                <th key={r} className="px-2 py-3 text-center text-[12px] font-semibold leading-tight">
                  {roleLabels[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(Object.keys(capabilityLabels) as Capability[]).map((cap) => (
              <tr key={cap} className="hover:bg-surface-2/50">
                <td className="px-4 py-2.5">
                  <span className="font-medium">{capabilityLabels[cap]}</span>
                  {LIVE.includes(cap) && (
                    <Pill tone="success" className="ml-2">
                      live in demo
                    </Pill>
                  )}
                </td>
                {ROLES.map((r) => {
                  const on = state.permissions[cap].includes(r);
                  const locked = r === "SAD" && cap === "requests.handle";
                  return (
                    <td key={r} className="px-2 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={locked}
                        onChange={(e) => setPermission(cap, r, e.target.checked, me.id)}
                        className="h-4 w-4 cursor-pointer accent-[var(--primary)] disabled:cursor-not-allowed"
                        aria-label={`${roleLabels[r]}: ${capabilityLabels[cap]}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Fixed safety rules" subtitle="Built in. No role can switch these off." icon={<ShieldCheck className="h-5 w-5" />} />
          <ul className="space-y-2 p-5">
            {FIXED.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13px]">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" /> {f}
              </li>
            ))}
          </ul>
        </Card>
        <Callout tone="info" title="Try it">
          Untick <b>Campus Admin → Export data</b>, then switch role to Meera Joshi and open Alumni records. The Export button is replaced by &quot;Your role can&apos;t export data&quot;. Rows marked &quot;live in demo&quot; change the screens straight away; the others show how the real matrix will look.
        </Callout>
      </div>
    </>
  );
}
