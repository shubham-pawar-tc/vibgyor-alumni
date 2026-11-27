"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Plus, Search, Wand2, X } from "lucide-react";
import { AdminOnly } from "@/components/admin";
import { Button, Callout, Card, CardHeader, Input, PageHeader, Pill, Req, Select, Tabs } from "@/components/ui";
import { masterUserKey } from "@/lib/data";
import { unmappedValues, type Unmapped } from "@/lib/admin";
import { can, useStore } from "@/lib/store";
import type { MasterKind } from "@/lib/types";

const LABEL: Record<MasterKind, string> = { college: "Colleges", programme: "Courses / programmes", industry: "Industries" };

export default function MastersPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <Masters />
    </AdminOnly>
  );
}

function Masters() {
  const { me, state, addMasterItem, removeAlias } = useStore();
  const [kind, setKind] = useState<MasterKind>("college");
  const [q, setQ] = useState("");
  const [newName, setNewName] = useState("");
  if (!me) return null;
  const allowed = can(state, me, "masters.edit");
  const all = unmappedValues(state);
  const todo = all.filter((u) => u.kind === kind);
  const items = state.masters[kind].filter((m) => !q || `${m.name} ${m.aliases.join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  const usage = (name: string) => state.users.filter((u) => u[masterUserKey[kind]] === name).length;

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="L5 · DM-3" />}
        title="Master lists"
        description="One agreed spelling for every college, course and industry, so search, filters and reports add up."
      />
      {!allowed && (
        <Callout tone="warning" className="mb-4">
          You can view these lists. Only roles with &quot;Edit master lists&quot; can change them.
        </Callout>
      )}
      <div className="mb-5">
        <Tabs
          tabs={(Object.keys(LABEL) as MasterKind[]).map((k) => ({ id: k, label: LABEL[k], count: all.filter((u) => u.kind === k).length || undefined }))}
          value={kind}
          onChange={(k) => {
            setKind(k);
            setQ("");
          }}
        />
      </div>

      <Card className="mb-5">
        <CardHeader title="Values to standardise" subtitle="Spellings in alumni records that don't match the list" icon={<Wand2 className="h-5 w-5" />} />
        {todo.length === 0 ? (
          <p className="flex items-center gap-2 px-5 py-4 text-body text-success">
            <CheckCircle2 className="h-4 w-4" /> Every {kind} in the records matches the list.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {todo.map((u) => (
              <MapRow key={u.value} u={u} disabled={!allowed} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title={`${LABEL[kind]} (${state.masters[kind].length})`} subtitle="Aliases are other spellings that are matched automatically" />
        <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input className="pl-9" placeholder="Search the list" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {allowed && (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newName.trim() || state.masters[kind].some((m) => m.name.toLowerCase() === newName.trim().toLowerCase())) return;
                addMasterItem(kind, newName.trim(), me.id);
                setNewName("");
              }}
            >
              <Input placeholder={`New ${kind}`} value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Button type="submit" variant="secondary" disabled={!newName.trim()}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </form>
          )}
        </div>
        <div className="divide-y divide-border">
          {items.map((m) => (
            <div key={m.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
              <p className="min-w-0 flex-1 text-body font-semibold">{m.name}</p>
              <div className="flex flex-wrap items-center gap-2">
                {m.aliases.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-0.5 pl-3 pr-1 text-label">
                    {a}
                    {allowed && (
                      <button onClick={() => removeAlias(kind, m.id, a)} className="grid h-4 w-4 place-items-center rounded-full hover:bg-border" aria-label={`Remove alias ${a}`}>
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
                <span className="ml-1 text-label tabular-nums text-muted">
                  {usage(m.name)} record{usage(m.name) === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function MapRow({ u, disabled }: { u: Unmapped; disabled: boolean }) {
  const { me, state, mapValue, addMasterItem } = useStore();
  const [target, setTarget] = useState(u.suggestion?.id ?? "");
  return (
    <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center">
      <div className="min-w-0 lg:w-64">
        <p className="truncate text-sm font-semibold">&quot;{u.value}&quot;</p>
        <p className="text-label text-muted">
          in {u.count} record{u.count === 1 ? "" : "s"}
          {u.why === "alias" && " · known alias"}
          {u.why === "similar" && " · looks similar"}
        </p>
      </div>
      <ArrowRight className="hidden h-4 w-4 text-muted lg:block" />
      <Select className="lg:flex-1" value={target} disabled={disabled} onChange={(e) => setTarget(e.target.value)} aria-label={`Standard value for ${u.value}`}>
        <option value="">Choose the standard name…</option>
        {state.masters[u.kind].map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </Select>
      <div className="flex gap-2">
        {u.suggestion && target === u.suggestion.id && <Pill tone="info">Suggested</Pill>}
        <Button size="sm" disabled={disabled || !target} onClick={() => mapValue(u.kind, u.value, target, me!.id)}>
          Standardise
        </Button>
        <Button size="sm" variant="ghost" disabled={disabled} onClick={() => addMasterItem(u.kind, u.value, me!.id)}>
          Add as new
        </Button>
      </div>
    </div>
  );
}
