"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, GraduationCap, Plus, XCircle } from "lucide-react";
import { AdminOnly, useScope } from "@/components/admin";
import { MaskedText } from "@/components/MaskPreview";
import { Avatar, Button, Callout, Card, Checkbox, Empty, Field, Input, Modal, PageHeader, Pill, Req, Select, Tabs, Textarea } from "@/components/ui";
import { campuses, campusName } from "@/lib/data";
import { maskKindLabel } from "@/lib/mask";
import { useStore } from "@/lib/store";
import type { MaskKind, VaaEvent } from "@/lib/types";
import { formatDateTime, timeAgo } from "@/lib/utils";

export default function ContentPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <Content />
    </AdminOnly>
  );
}

function Content() {
  const { me, state, decideJob } = useStore();
  const { inScope, group } = useScope();
  const [tab, setTab] = useState<"approve" | "jobs" | "events">("approve");
  const [creating, setCreating] = useState(false);
  if (!me) return null;

  const jobs = state.jobs.filter((j) => inScope(j.campusId));
  const pending = jobs.filter((j) => j.status === "pending");
  const events = state.events.filter((e) => e.campusIds === "all" || e.campusIds.some((c) => inScope(c)));

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="E5 · G1 · M4" />}
        title="Jobs & events"
        description={group ? "All 39 campuses" : `${campusName(me.campusIds[0])} only`}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New event
          </Button>
        }
      />
      <div className="mb-5">
        <Tabs
          tabs={[
            { id: "approve", label: "Jobs to approve", count: pending.length },
            { id: "jobs", label: "All jobs", count: jobs.length },
            { id: "events", label: "Events", count: events.length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "approve" &&
        (pending.length === 0 ? (
          <Card>
            <Empty icon={<CheckCircle2 className="h-6 w-6" />} title="Nothing waiting">
              New job posts from alumni appear here.
            </Empty>
          </Card>
        ) : (
          <div className="space-y-4">
            {pending.map((j) => {
              const poster = state.users.find((u) => u.id === j.postedBy);
              const kinds = [...j.description.matchAll(/\[(phone|email|link|handle|off-platform app) hidden\]/g)].map((m) => (m[1] === "off-platform app" ? "app" : m[1]) as MaskKind);
              return (
                <Card key={j.id} className="p-5">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] font-semibold">{j.title}</p>
                      <p className="text-[14px] text-muted">
                        {j.company} · {j.location} · {j.type}
                      </p>
                    </div>
                    {j.forStudents && <Pill tone="warning" icon={<GraduationCap className="h-3 w-3" />}>Wants to reach students</Pill>}
                  </div>
                  <p className="mt-3 rounded-xl bg-surface-2 p-3 text-[14.5px] leading-relaxed">
                    <MaskedText text={j.description} />
                  </p>
                  {kinds.length > 0 && (
                    <Callout tone="warning" className="mt-3" title="Contact details found">
                      The poster included a {[...new Set(kinds)].map((k) => maskKindLabel[k]).join(" and ")}. We hid it automatically. Approve as-is, or send it back so they can tidy the wording.
                    </Callout>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                    <Avatar name={poster?.name ?? "?"} size={30} />
                    <span className="min-w-0 flex-1 text-[13.5px] text-muted">
                      {poster?.name} · {poster?.role === "ALU" ? "Verified alumni" : poster?.role} · Batch {poster?.batch} · posted {timeAgo(j.at)}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => decideJob(j.id, false, me.id)}>
                      <XCircle className="h-4 w-4" /> Send back
                    </Button>
                    <Button size="sm" onClick={() => decideJob(j.id, true, me.id)}>
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ))}

      {tab === "jobs" && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[14px]">
            <thead className="border-b border-border text-left text-[13px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Job</th>
                <th className="px-4 py-3 font-semibold">Posted by</th>
                <th className="px-4 py-3 font-semibold">Campus</th>
                <th className="px-4 py-3 font-semibold">Interested</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{j.title}</p>
                    <p className="text-muted">{j.company}</p>
                  </td>
                  <td className="px-4 py-3">{state.users.find((u) => u.id === j.postedBy)?.name}</td>
                  <td className="px-4 py-3">{campusName(j.campusId)}</td>
                  <td className="px-4 py-3 tabular-nums">{j.interested.length}</td>
                  <td className="px-4 py-3">
                    <Pill tone={j.status === "approved" ? "success" : j.status === "pending" ? "warning" : j.status === "rejected" ? "danger" : "neutral"}>{j.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "events" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {events
            .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
            .map((e) => {
              const going = e.rsvps.filter((r) => r.status === "going");
              const seats = going.reduce((n, r) => n + 1 + (r.guests ?? 0), 0);
              return (
                <Card key={e.id} className="p-5">
                  <div className="flex items-center gap-2">
                    <Pill tone="primary">{e.kind}</Pill>
                    <span className="text-[13.5px] text-muted">{e.campusIds === "all" ? "All campuses" : campusName(e.campusIds[0])}</span>
                  </div>
                  <p className="mt-2 text-[15px] font-semibold">{e.title}</p>
                  <p className="text-[14px] text-muted">
                    {formatDateTime(e.start)} · {e.venue}
                  </p>
                  <p className="mt-1 text-[13.5px] text-muted">For: {e.audience.map((a) => ({ ALU: "Alumni", STU: "Students", PAR: "Parents" })[a]).join(", ")}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-[13.5px]">
                      <span className="text-muted">
                        {seats} going · {e.rsvps.filter((r) => r.status === "maybe").length} maybe
                      </span>
                      <span className="font-semibold tabular-nums">{Math.round((seats / e.capacity) * 100)}% full</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (seats / e.capacity) * 100)}%` }} />
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>
      )}

      {creating && <CreateEvent onClose={() => (setCreating(false), setTab("events"))} />}
    </>
  );
}

function CreateEvent({ onClose }: { onClose: () => void }) {
  const { me, createEvent } = useStore();
  const { group } = useScope();
  const [f, setF] = useState({
    title: "",
    kind: "Meetup" as VaaEvent["kind"],
    description: "",
    campus: group ? "all" : (me?.campusIds[0] ?? "c01"),
    date: new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10),
    time: "18:30",
    hours: 2,
    venue: "",
    online: false,
    capacity: 100,
    audience: { ALU: true, STU: false, PAR: false },
  });
  if (!me) return null;
  const aud = (Object.keys(f.audience) as ("ALU" | "STU" | "PAR")[]).filter((k) => f.audience[k]);
  const ok = f.title && f.venue && aud.length > 0;
  const studentsInvited = f.audience.STU;

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title="New event"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!ok}
            onClick={() => {
              const start = new Date(`${f.date}T${f.time}:00+05:30`);
              createEvent({
                title: f.title,
                kind: f.kind,
                description: f.description,
                campusIds: f.campus === "all" ? "all" : [f.campus],
                audience: aud,
                start: start.toISOString(),
                end: new Date(start.getTime() + f.hours * 3600_000).toISOString(),
                venue: f.venue,
                online: f.online,
                capacity: f.capacity,
                createdBy: me.id,
              });
              onClose();
            }}
          >
            <CalendarDays className="h-4 w-4" /> Publish event
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Title" htmlFor="et">
            <Input id="et" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Pune chapter meetup" />
          </Field>
        </div>
        <Field label="Type" htmlFor="ek">
          <Select id="ek" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as VaaEvent["kind"] })}>
            {["Reunion", "Webinar", "Career talk", "Meetup"].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </Select>
        </Field>
        <Field label="Campus" htmlFor="ec">
          <Select id="ec" value={f.campus} disabled={!group} onChange={(e) => setF({ ...f, campus: e.target.value })}>
            {group && <option value="all">All campuses</option>}
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date" htmlFor="ed">
          <Input id="ed" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Start (IST)" htmlFor="eti">
            <Input id="eti" type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
          </Field>
          <Field label="Hours" htmlFor="eh">
            <Input id="eh" type="number" min={1} max={12} value={f.hours} onChange={(e) => setF({ ...f, hours: +e.target.value || 1 })} />
          </Field>
        </div>
        <Field label="Venue or link" htmlFor="ev">
          <Input id="ev" value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} />
        </Field>
        <Field label="Capacity" htmlFor="ecap">
          <Input id="ecap" type="number" min={1} value={f.capacity} onChange={(e) => setF({ ...f, capacity: +e.target.value || 1 })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description" htmlFor="ede">
            <Textarea id="ede" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </Field>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <p className="text-[14px] font-semibold">Who can sign up?</p>
          <div className="flex flex-wrap gap-4">
            <Checkbox checked={f.audience.ALU} onChange={(v) => setF({ ...f, audience: { ...f.audience, ALU: v } })} label="Alumni" />
            <Checkbox checked={f.audience.STU} onChange={(v) => setF({ ...f, audience: { ...f.audience, STU: v } })} label="Students" />
            <Checkbox checked={f.audience.PAR} onChange={(v) => setF({ ...f, audience: { ...f.audience, PAR: v } })} label="Parents" />
          </div>
          <Checkbox checked={f.online} onChange={(v) => setF({ ...f, online: v })} label="Online event" />
          {studentsInvited && (
            <Callout tone="warning" className="mt-2">
              Student events must be in school or online with staff present. Only students with parent consent can sign up.
            </Callout>
          )}
        </div>
      </div>
    </Modal>
  );
}
