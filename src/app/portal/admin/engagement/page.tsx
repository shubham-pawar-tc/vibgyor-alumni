"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Download, FileUp, Plus, XCircle } from "lucide-react";
import { AdminOnly, NoPermission, useScope } from "@/components/admin";
import { Avatar, Button, Card, Field, Input, Modal, PageHeader, Pill, Req, Select, Stat, Textarea } from "@/components/ui";
import { download, parseCsv, toCsv } from "@/lib/admin";
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
        {list.length === 0 && <p className="p-5 text-body text-muted">Nothing logged yet.</p>}
        {list.map((e) => {
          const a = state.users.find((u) => u.id === e.alumniId);
          const s = state.users.find((u) => u.id === e.staffId);
          return (
            <div key={e.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:w-56">
                <Avatar name={a?.name ?? "?"} size={34} />
                <div className="min-w-0">
                  <Link href={`/portal/people/${e.alumniId}`} className="block truncate text-body font-semibold hover:underline">
                    {a?.name}
                  </Link>
                  <p className="truncate text-label text-muted">
                    Batch {a?.batch} · {campusName(e.campusId)}
                  </p>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="primary">{e.mode}</Pill>
                  <Pill>{e.category}</Pill>
                  {e.source === "bulk" && <Pill tone="info">Bulk upload</Pill>}
                </div>
                <p className="mt-2 text-body">{e.note}</p>
              </div>
              <p className="shrink-0 text-label text-muted sm:text-right">
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

const COLS = ["email", "mode", "category", "note", "date"] as const;
type Col = (typeof COLS)[number];

const TEMPLATE = `${COLS.join(",")}\npriya.sharma@example.com,Email,Mentoring,Invited to the UK webinar panel,2026-11-20\n`;

/* Sample shows each check: a note with a comma (quoted), DD/MM/YYYY, lower-case mode, unknown email, bad mode, a repeat row. */
const SAMPLE = `email,mode,category,note,date
priya.sharma@example.com,Email,Mentoring,"Invited to the UK webinar panel, said yes",2026-11-20
arjun.nair@example.com,meeting,Placement,Confirmed 8 places for May shadowing,18/11/2026
someone@unknown.com,Call,General,Wrong number,2026-11-17
rohan.gupta@example.com,Phone,Event,Reunion speaker briefing,2026-11-15
priya.sharma@example.com,Email,Mentoring,"Invited to the UK webinar panel, said yes",2026-11-20`;

/** Accepts YYYY-MM-DD, DD/MM/YYYY and DD-MM-YYYY (Excel in India). Returns YYYY-MM-DD or null. */
function parseDate(raw: string): string | null {
  const s = raw.trim();
  let y: number, m: number, d: number;
  let mt = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (mt) [y, m, d] = [+mt[1], +mt[2], +mt[3]];
  else if ((mt = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/))) [d, m, y] = [+mt[1], +mt[2], +mt[3]];
  else return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const pick = <T extends string>(list: readonly T[], v: string) => list.find((x) => x.toLowerCase() === v.trim().toLowerCase());
const dupKey = (alumniId: string, mode: string, category: string, day: string, note: string) =>
  [alumniId, mode, category, day, note.trim().toLowerCase().replace(/\s+/g, " ")].join("|");

function BulkUpload({ onClose }: { onClose: () => void }) {
  const { me, state, addEngagements } = useStore();
  const { inScope } = useScope();
  const [text, setText] = useState(SAMPLE);
  const [fileName, setFileName] = useState("");

  const { headerError, rows } = useMemo(() => {
    const table = parseCsv(text);
    if (!table.length) return { headerError: "Nothing to import yet.", rows: [] };
    const header = table[0].map((h) => h.trim().toLowerCase());
    const missing = COLS.filter((c) => !header.includes(c));
    if (missing.length) return { headerError: `The first row must name the columns. Missing: ${missing.join(", ")}.`, rows: [] };
    const idx = Object.fromEntries(COLS.map((c) => [c, header.indexOf(c)])) as Record<Col, number>;

    const existing = new Set(state.engagements.map((e) => dupKey(e.alumniId, e.mode, e.category, e.at.slice(0, 10), e.note)));
    const seen = new Map<string, number>();
    const today = new Date().toISOString().slice(0, 10);

    const rows = table.slice(1).map((cells, i) => {
      const n = i + 2;
      const raw = Object.fromEntries(COLS.map((c) => [c, (cells[idx[c]] ?? "").trim()])) as Record<Col, string>;
      const errors: string[] = [];
      const u = state.users.find((x) => x.email.toLowerCase() === raw.email.toLowerCase() && x.role === "ALU");
      if (!raw.email) errors.push("Email is empty");
      else if (!u) errors.push("No alumnus with this email");
      else if (!inScope(u.campusIds[0])) errors.push("Outside your campus");
      const mode = pick(MODES, raw.mode);
      if (!mode) errors.push(`Mode must be ${MODES.join(" / ")}`);
      const category = pick(CATS, raw.category);
      if (!category) errors.push(`Category must be ${CATS.join(" / ")}`);
      const day = parseDate(raw.date);
      if (!day) errors.push("Date must be YYYY-MM-DD or DD/MM/YYYY");
      else if (day > today) errors.push("Date is in the future");
      if (raw.note.length > 500) errors.push("Note is longer than 500 characters");

      let dup: string | undefined;
      if (!errors.length && u && mode && category && day) {
        const k = dupKey(u.id, mode, category, day, raw.note);
        if (existing.has(k)) dup = "Already in the log";
        else if (seen.has(k)) dup = `Same as row ${seen.get(k)}`;
        else seen.set(k, n);
      }
      const entry: Omit<EngagementEntry, "id"> | undefined =
        !errors.length && !dup && u && mode && category && day
          ? { alumniId: u.id, staffId: me!.id, campusId: u.campusIds[0], mode, category, note: raw.note, at: new Date(`${day}T12:00:00+05:30`).toISOString(), source: "bulk" }
          : undefined;
      return { n, raw, name: u?.name, errors, dup, entry };
    });
    return { headerError: "", rows };
  }, [text, state.users, state.engagements, me, inScope]);

  const good = rows.filter((r) => r.entry);
  const bad = rows.filter((r) => r.errors.length);
  const dups = rows.filter((r) => r.dup);
  const downloadErrors = () =>
    download(
      "engagement-upload-errors.csv",
      toCsv([[...COLS, "row", "problem"], ...bad.map((r) => [...COLS.map((c) => r.raw[c]), r.n, r.errors.join("; ")])])
    );
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
        <p className="text-sm text-muted">
          Save your Excel sheet as CSV and choose it, or paste the rows below. Columns (any order): {COLS.join(", ")}. Notes with commas are fine when Excel quotes them. Dates can be YYYY-MM-DD or DD/MM/YYYY.
          A sample with a few mistakes is filled in.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-2">
            <FileUp className="h-4 w-4" /> {fileName || "Choose a .csv file"}
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setFileName(f.name); f.text().then(setText); }
                e.target.value = "";
              }}
            />
          </label>
          <Button size="sm" variant="secondary" onClick={() => download("engagement-template.csv", TEMPLATE)}>
            <Download className="h-4 w-4" /> Template
          </Button>
        </div>
        <Textarea rows={6} className="font-mono text-label" value={text} onChange={(e) => { setText(e.target.value); setFileName(""); }} aria-label="CSV rows" />

        {headerError ? (
          <p className="text-sm font-semibold text-danger">{headerError}</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Pill tone="success">{good.length} ready</Pill>
              {bad.length > 0 && <Pill tone="danger">{bad.length} with errors</Pill>}
              {dups.length > 0 && <Pill tone="warning">{dups.length} duplicate{dups.length === 1 ? "" : "s"} skipped</Pill>}
              {bad.length > 0 && (
                <Button size="sm" variant="secondary" onClick={downloadErrors}>
                  <Download className="h-4 w-4" /> Download rows to fix
                </Button>
              )}
            </div>
            <div className="max-h-56 overflow-y-auto rounded-xl border border-border">
              {rows.map((r) => (
                <div key={r.n} className="flex items-start gap-2 border-b border-border px-3 py-2 text-sm last:border-0">
                  {r.entry ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : r.dup ? (
                    <Copy className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                  )}
                  <span className="w-12 shrink-0 text-muted">Row {r.n}</span>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{r.name ?? (r.raw.email || "—")}</span>
                    {r.entry && <span className="text-muted"> · {r.entry.mode} · {r.entry.category} · {formatDate(r.entry.at)}</span>}
                    {r.errors.length > 0 && <span className="block text-danger">{r.errors.join(" · ")}</span>}
                    {r.dup && <span className="block text-warning">{r.dup}, skipped</span>}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
