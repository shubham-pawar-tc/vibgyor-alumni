"use client";

import { useState } from "react";
import { Search, Send } from "lucide-react";
import { Avatar, Button, Callout, Card, Input, PageHeader, Pill, Req, Select } from "@/components/ui";
import { AdminOnly, useScope } from "@/components/admin";
import { StatusPill } from "@/components/Homes";
import { campusName, consentPurposes } from "@/lib/data";
import { hasConsent, useStore } from "@/lib/store";
import type { ConsentPurpose } from "@/lib/types";
import { cn } from "@/lib/utils";

function Inner() {
  const { me, state, requestConsent } = useStore();
  const { inScope } = useScope();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [sent, setSent] = useState<string[]>([]);

  const minClass = state.campusMinClass[me!.campusIds[0]] ?? 8;
  const students = state.users
    .filter((u) => u.role === "STU" && inScope(u.campusIds[0]))
    .filter((u) => filter === "all" || u.studentStatus === filter)
    .filter((u) => !q || u.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.studentStatus === "awaiting_consent" ? -1 : 1) - (b.studentStatus === "awaiting_consent" ? -1 : 1));
  const awaiting = state.users.filter((u) => u.role === "STU" && inScope(u.campusIds[0]) && u.studentStatus === "awaiting_consent" && (u.className ?? 0) >= (state.campusMinClass[u.campusIds[0]] ?? 8));

  const send = (ids: string[]) => {
    ids.forEach((id) => requestConsent(id, me!.id));
    setSent((s) => [...s, ...ids]);
  };

  return (
    <>
      <PageHeader
        eyebrow={<div className="flex gap-2"><Req ids="CS-1" /> <Req ids="CS-2" /> <Req ids="A7" /></div>}
        title="Student consents"
        description="Students are created from school records and stay switched off until a parent consents."
        actions={
          <Button onClick={() => send(awaiting.map((a) => a.id))} disabled={awaiting.length === 0}>
            <Send className="h-4 w-4" /> Remind all awaiting ({awaiting.length})
          </Button>
        }
      />
      <Callout tone="info" className="mb-5">
        Age gate for {campusName(me!.campusIds[0]).split(",")[0]}: students from <b>Class {minClass}</b> upwards can be activated. Younger students are not invited. Set by the Super Admin.
      </Callout>
      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students" className="pl-10" aria-label="Search students" />
          </div>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="awaiting_consent">Awaiting consent</option>
            <option value="active">Active</option>
            <option value="paused">Paused (withdrawn)</option>
            <option value="not_eligible">Below age gate</option>
          </Select>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-label text-muted">
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-3 py-3 font-semibold">Parent</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                {(Object.keys(consentPurposes) as ConsentPurpose[]).map((p) => (
                  <th key={p} className="px-3 py-3 text-center font-semibold">
                    {consentPurposes[p].short}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s) => {
                const guardianNames = (s.parentIds ?? []).map((id) => state.users.find((u) => u.id === id)?.name).filter(Boolean).join(", ");
                const below = (s.className ?? 0) < (state.campusMinClass[s.campusIds[0]] ?? 8);
                return (
                  <tr key={s.id} className={cn("hover:bg-surface-2/50", below && "opacity-60")}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} size={30} />
                        <div>
                          <p className="font-semibold">{s.name}</p>
                          <p className="text-label text-muted">Class {s.className}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted">{guardianNames || "—"}</td>
                    <td className="px-3 py-3">{below ? <Pill>Below age gate</Pill> : <StatusPill status={s.studentStatus} />}</td>
                    {(Object.keys(consentPurposes) as ConsentPurpose[]).map((p) => (
                      <td key={p} className="px-3 py-3 text-center">
                        {hasConsent(state, s.id, p) ? <span className="inline-block h-2.5 w-2.5 rounded-full bg-success" title="Given" /> : <span className="inline-block h-2.5 w-2.5 rounded-full bg-border" title="Not given" />}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right">
                      {s.studentStatus === "awaiting_consent" && !below && (
                        sent.includes(s.id) ? (
                          <span className="text-label font-semibold text-success">Sent</span>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => send([s.id])}>
                            Send reminder
                          </Button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="mt-3 text-label text-muted">Staff can see consent status but can never give consent on a parent&apos;s behalf.</p>
    </>
  );
}

export default function ConsentsAdminPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <Inner />
    </AdminOnly>
  );
}
