"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, FileUp, Plus, XCircle } from "lucide-react";
import { AdminOnly, NoPermission, useScope } from "@/components/admin";
import { Avatar, Button, Card, Field, Input, Modal, PageHeader, Pill, Req, Select, Stat, Textarea } from "@/components/ui";
import { campusName } from "@/lib/data";
import { can, useStore } from "@/lib/store";
import type { EngagementCategory, EngagementEntry, EngagementMode } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const MODES: EngagementMode[] = ["Call", "Email", "Meeting", "Event", "WhatsApp"];
const CATS: EngagementCategory[] = ["Mentoring", "Event", "Placement", "Fundraising", "Data update", "General"];

export default function EngagementPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me} alsoAllow={["TCH"]}>
      <Engagement />
    </AdminOnly>
  );
}

function Engagement() {
  const { me, state } = useStore();
  const { inScope } = useScope();
  const [mode, setMode] = useState<"all" | EngagementMode>("all");
  const [cat, setCat] = useState<"all" | EngagementCategory>("all");
  const [adding, setAdding] = useState(false);
  const [bulk, setBulk] = useState(false);
  if (!me) return null;
  const mine = state.engagements.filter((e) => inScope(e.campusId));
  const list = mine.filter((e) => (mode === "all" || e.mode === mode) && (cat === "all" || e.category === cat)).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const people = new Set(mine.map((e) => e.alumniId)).size;
  const allowed = can(state, me, "engagement.log");

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="K1" />}
        title="Engagement log"
        description="Every conversation the alumni office has with an alumnus, in one place."
        actions={
          allowed ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setBulk(true)}>
                <FileUp className="h-4 w-4" /> Bulk upload
              </Button>
              <Button onClick={() => setAdding(true)}>
                <Plus className="h-4 w-4" /> Log interaction
              </Button>
            </div>
          ) : (
            <NoPermission what="log interactions" />
          )
        }
      />
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Interactions" value={mine.length} />
        <Stat label="Alumni reached" value={people} />
        <Stat label="This month" value={mine.filter((e) => Date.now() - Date.parse(e.at) < 30 * 86400_000).length} />
      </div>
      <Card className="mb-4 flex flex-col gap-2 p-3 sm:flex-row">
        <Select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} aria-label="Mode">
          <option value="all">All modes</option>
          {MODES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </Select>
        <Select value={cat} onChange={(e) => setCat(e.target.value as typeof cat)} aria-label="Category">
          <option value="all">All categories</option>
          {CATS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </Select>
      </Card>
      <Card className="divide-y divide-border">
        {list.length === 0 && <p className="p-5 text-[14.5px] text-muted">Nothing logged yet.</p>}
        {list.map((e) => {
          const a = state.users.find((u) => u.id === e.alumniId);
          const s = state.users.find((u) => u.id === e.staffId);
          return (
            <div key={e.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:w-56">
                <Avatar name={a?.name ?? "?"} size={34} />
                <div className="min-w-0">
                  <Link href={`/portal/people/${e.alumniId}`} className="block truncate text-[14.5px] font-semibold hover:underline">
                    {a?.name}
                  </Link>
                  <p className="truncate text-[13px] text-muted">
                    Batch {a?.batch} · {campusName(e.campusId)}
                  </p>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill tone="primary">{e.mode}</Pill>
                  <Pill>{e.category}</Pill>
                  {e.source === "bulk" && <Pill tone="info">Bulk upload</Pill>}
                </div>
                <p className="mt-1.5 text-[14.5px]">{e.note}</p>
              </div>
              <p className="shrink-0 text-[13px] text-muted sm:text-right">
                {formatDate(e.at)}
                <br />
                by {s?.name}
              </p>
            </div>
          );
        })}
      </Card>
      {adding && <AddOne onClose={() => setAdding(false)} />}
      {bulk && <BulkUpload onClose={() => setBulk(false)} />}
    </>
  );
}

function AddOne({ onClose }: { onClose: () => void }) {
  const { me, state, addEngagements } = useStore();
  const { inScope } = useScope();
  const alumni = state.users.filter((u) => u.role === "ALU" && inScope(u.campusIds[0])).sort((a, b) => a.name.localeCompare(b.name));
  const [f, setF] = useState({ alumniId: alumni[0]?.id ?? "", mode: "Call" as EngagementMode, category: "General" as EngagementCategory, note: "", date: new Date().toISOString().slice(0, 10) });
  return (
    <Modal
      open
      onClose={onClose}
      title="Log an interaction"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!f.note.trim() || !f.alumniId}
            onClick={() => {
              const a = state.users.find((u) => u.id === f.alumniId)!;
              addEngagements([{ alumniId: a.id, staffId: me!.id, campusId: a.campusIds[0], mode: f.mode, category: f.category, note: f.note.trim(), at: new Date(`${f.date}T12:00:00+05:30`).toISOString(), source: "manual" }], me!.id);
              onClose();
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Alumnus" htmlFor="ea">
            <Select id="ea" value={f.alumniId} onChange={(e) => setF({ ...f, alumniId: e.target.value })}>
              {alumni.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} · Batch {u.batch}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="How" htmlFor="em">
          <Select id="em" value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value as EngagementMode })}>
            {MODES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </Field>
        <Field label="About" htmlFor="ec">
          <Select id="ec" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as EngagementCategory })}>
            {CATS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </Field>
        <Field label="Date" htmlFor="ed">
          <Input id="ed" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Note" htmlFor="en">
            <Textarea id="en" rows={3} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="What was discussed and any follow-up" />
          </Field>
        </div>
      </div>
    </Modal>
  );
}

const SAMPLE = `email,mode,category,note,date
priya.sharma@example.com,Email,Mentoring,Invited to the UK webinar panel,2026-11-20
arjun.nair@example.com,Meeting,Placement,Confirmed 8 places for May shadowing,2026-11-18
someone@unknown.com,Call,General,Wrong number,2026-11-17
rohan.gupta@example.com,Phone,Event,Reunion speaker briefing,2026-11-15`;

function BulkUpload({ onClose }: { onClose: () => void }) {
  const { me, state, addEngagements } = useStore();
  const { inScope } = useScope();
  const [text, setText] = useState(SAMPLE);
  const rows = useMemo(() => {
    const lines = text.trim().split(/\r?\n/).slice(1).filter(Boolean);
    return lines.map((line, i) => {
      const [email, mode, category, note, date] = line.split(",").map((x) => x?.trim());
      const u = state.users.find((x) => x.email.toLowerCase() === (email ?? "").toLowerCase());
      const errors: string[] = [];
      if (!u) errors.push("No alumnus with this email");
      else if (!inScope(u.campusIds[0])) errors.push("Outside your campus");
      if (!MODES.includes(mode as EngagementMode)) errors.push(`Mode must be ${MODES.join("/")}`);
      if (!CATS.includes(category as EngagementCategory)) errors.push("Unknown category");
      if (!date || isNaN(Date.parse(date))) errors.push("Bad date");
      const entry: Omit<EngagementEntry, "id"> | undefined =
        errors.length === 0 && u
          ? { alumniId: u.id, staffId: me!.id, campusId: u.campusIds[0], mode: mode as EngagementMode, category: category as EngagementCategory, note: note ?? "", at: new Date(`${date}T12:00:00+05:30`).toISOString(), source: "bulk" }
          : undefined;
      return { n: i + 2, email, name: u?.name, errors, entry };
    });
  }, [text, state.users, me, inScope]);
  const good = rows.filter((r) => r.entry);
  return (
    <Modal
      open
      wide
      onClose={onClose}
      title="Bulk upload interactions"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!good.length}
            onClick={() => {
              addEngagements(good.map((r) => r.entry!), me!.id);
              onClose();
            }}
          >
            Import {good.length} row{good.length === 1 ? "" : "s"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-[14px] text-muted">Paste rows from Excel as CSV, or choose a .csv file. Columns: email, mode, category, note, date. A sample with two mistakes is filled in.</p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="text-[14px]"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) f.text().then(setText);
          }}
        />
        <Textarea rows={6} className="font-mono text-[13px]" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="max-h-56 overflow-y-auto rounded-xl border border-border">
          {rows.map((r) => (
            <div key={r.n} className="flex items-start gap-2 border-b border-border px-3 py-2 text-[13.5px] last:border-0">
              {r.entry ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />}
              <span className="w-12 shrink-0 text-muted">Row {r.n}</span>
              <span className="min-w-0 flex-1">
                <span className="font-medium">{r.name ?? r.email}</span>
                {r.errors.length > 0 && <span className="block text-danger">{r.errors.join(" · ")}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
