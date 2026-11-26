"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Callout, Card, CardHeader, Input, PageHeader, Req, Select } from "@/components/ui";
import { campuses } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { me, state, setMinClass } = useStore();
  const [q, setQ] = useState("");
  if (!me) return null;
  if (me.role !== "SAD") return <Callout tone="warning">Settings are for the Super Admin. Switch to Rahul Menon.</Callout>;

  const list = campuses.filter((c) => !q || `${c.name} ${c.city}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader eyebrow={<Req ids="CS-1" />} title="Settings" description="Platform-wide settings for the VIBGYOR Alumni Platform." />
      <Card>
        <CardHeader title="Student age gate" subtitle="The lowest class that can be invited, per campus. Students below it are never activated." />
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a campus" className="pl-10" aria-label="Find a campus" />
          </div>
        </div>
        <div className="max-h-[520px] divide-y divide-border overflow-y-auto">
          {list.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div>
                <p className="text-[14px] font-medium">{c.name}</p>
                <p className="text-[13px] text-muted">{c.city}</p>
              </div>
              <Select value={state.campusMinClass[c.id] ?? 8} onChange={(e) => setMinClass(c.id, Number(e.target.value), me.id)} className="!h-9 w-[140px]" aria-label={`Minimum class for ${c.name}`}>
                {[6, 7, 8, 9, 10, 11].map((n) => (
                  <option key={n} value={n}>
                    Class {n}+
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
