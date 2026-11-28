"use client";

import { check, clean, whenFilled } from "@/lib/validate";
import { useState } from "react";
import { Eye, Handshake, Plus, Search, X } from "lucide-react";
import { Gate } from "@/components/Gate";
import { NoPermission } from "@/components/admin";
import { Avatar, Button, Callout, Card, Empty, Field, FieldError, Input, Modal, PageHeader, Pill, Req, Select, Stat, Tabs, Textarea } from "@/components/ui";
import { campusName } from "@/lib/data";
import { bookingStatus } from "@/lib/labels";
import { can, hasConsent, useStore } from "@/lib/store";
import type { Booking, GuideIntro, User } from "@/lib/types";
import { formatDateTime, timeAgo } from "@/lib/utils";

const future = (v: string) => (v && new Date(v).getTime() < Date.now() ? "Pick a time in the future" : "");

export default function MczPage() {
  return (
    <Gate roles={["MCZ"]} why="For MyCareerZ counsellors only.">
      <Mcz />
    </Gate>
  );
}

function Mcz() {
  const { me, state, updateBooking, logView, createEvent } = useStore();
  const [tab, setTab] = useState<"bookings" | "students" | "guides" | "webinars" | "report">("bookings");
  const [viewing, setViewing] = useState<User | null>(null);
  const [confirm, setConfirm] = useState<Booking | null>(null);
  const [slot, setSlot] = useState("");
  const [web, setWeb] = useState(false);
  const [w, setW] = useState({ title: "", start: "", url: "" });
  if (!me) return null;
  const mine = (cid: string) => me.campusIds.includes(cid);

  const bookings = state.bookings.filter((b) => mine(b.campusId));
  const students = can(state, me, "mcz.students") ? state.users.filter((u) => u.role === "STU" && mine(u.campusIds[0]) && u.studentStatus === "active" && hasConsent(state, u.id, "mcz")) : [];
  const guides = state.users.filter((u) => u.role === "ALU" && u.mczGuide && !u.deactivated);
  const webinars = state.events.filter((e) => e.createdBy === me.id);
  const name = (id: string) => state.users.find((u) => u.id === id)?.name ?? "—";
  const urlOk = !check.url(w.url);
  const wTitle = whenFilled(w.title, check.text(w.title, "Title", { min: 3, max: 100 }));

  const open = (u: User) => {
    logView(me.id, `${u.name} (MyCareerZ)`, u.campusIds[0]);
    setViewing(u);
  };

  return (
    <>
      <PageHeader eyebrow={<Req ids="MCZ · cond. 4, 7, 12, 19, 26 · CS-16" />} title="MyCareerZ" description={`Your campuses: ${me.campusIds.map((c) => campusName(c)).join(", ")}. You only see students whose parent switched on MyCareerZ sharing. Every profile you open is logged.`} />
      <div className="mb-5">
        <Tabs
          tabs={[
            { id: "bookings", label: "Bookings", count: bookings.filter((b) => b.status === "referred" || b.status === "requested").length },
            { id: "students", label: "Consented students", count: students.length },
            { id: "guides", label: "Alumni guides", count: guides.length },
            { id: "webinars", label: "Webinars", count: webinars.length },
            { id: "report", label: "My funnel" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "bookings" &&
        (bookings.length === 0 ? (
          <Card>
            <Empty title="No bookings yet" />
          </Card>
        ) : (
          <Card className="divide-y divide-border">
            {bookings.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center gap-3 px-5 py-4 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {name(b.studentId)} <span className="font-normal text-muted">· {b.topic}</span>
                  </p>
                  <p className="text-muted">
                    {b.status === "referred" ? `Referred by ${name(b.bookedBy)}` : `Booked by ${name(b.bookedBy)}`}
                    {b.paymentId ? " · paid" : ""} · {timeAgo(b.at)}
                    {b.slot ? ` · ${formatDateTime(b.slot)}` : ""}
                  </p>
                  {b.note && <p className="mt-1 text-muted">&ldquo;{b.note}&rdquo;</p>}
                </div>
                <Pill tone={bookingStatus[b.status].tone}>{bookingStatus[b.status].label}</Pill>
                {(b.status === "referred" || b.status === "requested") && (
                  <Button size="sm" onClick={() => { setConfirm(b); setSlot(b.slot ? b.slot.slice(0, 16) : ""); }}>
                    Confirm a time
                  </Button>
                )}
                {b.status === "confirmed" && (
                  <Button size="sm" variant="secondary" onClick={() => updateBooking(b.id, "done", me.id)}>
                    Mark done
                  </Button>
                )}
              </div>
            ))}
          </Card>
        ))}

      {tab === "students" &&
        (!can(state, me, "mcz.students") ? (
          <Card className="p-6">
            <NoPermission what="see students" />
          </Card>
        ) : students.length === 0 ? (
          <Card>
            <Empty title="No consented students yet">Students appear here once a parent switches on MyCareerZ sharing in their Consent centre.</Empty>
          </Card>
        ) : (
          <Card className="divide-y divide-border">
            {students.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-4 text-sm">
                <Avatar name={u.name} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-muted">
                    Class {u.className} · {campusName(u.campusIds[0])}
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => open(u)}>
                  <Eye className="h-4 w-4" /> Open
                </Button>
              </div>
            ))}
          </Card>
        ))}

      {tab === "guides" && <GuidesTab guides={guides} students={students} />}

      {tab === "webinars" && (
        <>
          <div className="mb-4">
            <Button onClick={() => { setWeb(true); setW({ title: "", start: "", url: "" }); }}>
              <Plus className="h-4 w-4" /> New webinar
            </Button>
          </div>
          {webinars.length === 0 ? (
            <Card>
              <Empty title="No webinars yet">Webinars go to students and parents at your campuses and appear in their Events.</Empty>
            </Card>
          ) : (
            <Card className="divide-y divide-border">
              {webinars.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-4 text-sm">
                  <span>
                    <b>{e.title}</b> <span className="text-muted">· {formatDateTime(e.start)}</span>
                  </span>
                  <span className="text-muted">{e.rsvps.filter((r) => r.status === "going").length} going</span>
                </div>
              ))}
            </Card>
          )}
        </>
      )}

      {tab === "report" && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Stat label="Consented students" value={students.length} />
          <Stat label="Referred by teachers" value={bookings.filter((b) => state.users.find((u) => u.id === b.bookedBy)?.role === "TCH").length} tone="info" />
          <Stat label="Requested" value={bookings.filter((b) => b.status !== "referred").length} tone="warning" />
          <Stat label="Confirmed or done" value={bookings.filter((b) => b.status === "confirmed" || b.status === "done").length} tone="success" />
          <Stat label="My webinars" value={webinars.length} />
          <p className="col-span-full text-label text-muted">Only your own campuses and your own activity. No alumni or other counsellors&apos; data.</p>
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name ?? ""}>
        {viewing && (
          <div className="space-y-2 text-sm">
            <p>
              Class {viewing.className} · {campusName(viewing.campusIds[0])}
            </p>
            <p className="font-semibold">3C choices</p>
            {(viewing.threeC ?? []).length ? (
              viewing.threeC!.map((c, i) => (
                <p key={i} className="text-muted">
                  {i + 1}. {[c.country, c.course, c.college].filter(Boolean).join(" · ")}
                </p>
              ))
            ) : (
              <p className="text-muted">Not filled in yet.</p>
            )}
            {(viewing.interests ?? []).length > 0 && <p className="text-muted">Interests: {viewing.interests!.join(", ")}</p>}
            <p className="pt-2 text-label text-muted">This view was written to the audit log. Contact details are not shared with MyCareerZ.</p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Confirm session time"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              disabled={!slot || !!future(slot)}
              onClick={() => {
                if (confirm) updateBooking(confirm.id, "confirmed", me.id, new Date(slot).toISOString());
                setConfirm(null);
              }}
            >
              Confirm and tell the parent
            </Button>
          </>
        }
      >
        <Input type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={slot} invalid={!!future(slot)} onChange={(e) => setSlot(e.target.value)} aria-label="Session time" />
        <FieldError error={future(slot)} />
      </Modal>

      <Modal
        open={web}
        onClose={() => setWeb(false)}
        title="New webinar"
        footer={
          <>
            <Button variant="secondary" onClick={() => setWeb(false)}>
              Cancel
            </Button>
            <Button
              disabled={!!check.text(w.title, "t", { min: 3, max: 100 }) || !w.start || !!future(w.start) || !urlOk}
              onClick={() => {
                const start = new Date(w.start);
                createEvent({
                  title: w.title.trim(),
                  kind: "Webinar",
                  description: "MyCareerZ webinar for students and parents.",
                  campusIds: me.campusIds,
                  audience: ["STU", "PAR"],
                  start: start.toISOString(),
                  end: new Date(start.getTime() + 3600_000).toISOString(),
                  venue: "Online – link sent to registered attendees",
                  online: true,
                  capacity: 300,
                  createdBy: me.id,
                  joinUrl: w.url,
                });
                setWeb(false);
              }}
            >
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input placeholder="Title" value={w.title} invalid={!!wTitle} onChange={(e) => setW({ ...w, title: clean.text(e.target.value, 100) })} aria-label="Title" />
          <FieldError error={wTitle} />
          <Input type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={w.start} invalid={!!future(w.start)} onChange={(e) => setW({ ...w, start: e.target.value })} aria-label="Start" />
          <FieldError error={future(w.start)} />
          <Input placeholder="https://meet.google.com/abc-defg-hij" value={w.url} invalid={!!whenFilled(w.url, check.url(w.url))} onChange={(e) => setW({ ...w, url: clean.url(e.target.value) })} aria-label="Meeting link" />
          <FieldError error={whenFilled(w.url, check.url(w.url))} />
        </div>
      </Modal>
    </>
  );
}

const introPill: Record<GuideIntro["status"], { label: string; tone: "warning" | "success" | "neutral" }> = {
  requested: { label: "Intro requested", tone: "warning" },
  introduced: { label: "Introduced", tone: "success" },
  declined: { label: "Not possible", tone: "neutral" },
};

/** F6 / cond. 4: opted-in guides, filtered by country, university and course; intros go through the guide's campus alumni office. */
function GuidesTab({ guides, students }: { guides: User[]; students: User[] }) {
  const { me, state, requestGuideIntro } = useStore();
  const [country, setCountry] = useState("");
  const [college, setCollege] = useState("");
  const [q, setQ] = useState("");
  const [asking, setAsking] = useState<User | null>(null);
  const [form, setForm] = useState({ studentId: "", reason: "" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  if (!me) return null;

  const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
  const countries = uniq(guides.map((g) => g.country));
  const colleges = uniq(guides.filter((g) => !country || g.country === country).map((g) => g.college));
  const term = q.trim().toLowerCase();
  const shown = guides
    .filter((g) => (!country || g.country === country) && (!college || g.college === college))
    .filter((g) => !term || [g.course, g.college, g.country, g.name].some((v) => v?.toLowerCase().includes(term)))
    .sort((a, b) => (a.country ?? "").localeCompare(b.country ?? "") || a.name.localeCompare(b.name));
  const intros = state.guideIntros.filter((x) => x.counsellorId === me.id);
  const latest = (gid: string) => intros.find((x) => x.guideId === gid);
  const nameOf = (id?: string) => state.users.find((u) => u.id === id)?.name;
  const filtered = !!(country || college || term);

  return (
    <>
      <Callout tone="info" className="mb-4">
        Only alumni who opted in as MyCareerZ guides are listed, with their study path. You can&apos;t contact them directly: ask for an introduction and their campus alumni office connects you.
      </Callout>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_1fr_1.2fr_auto]">
        <Select aria-label="Country" value={country} onChange={(e) => { setCountry(e.target.value); setCollege(""); }}>
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c} ({guides.filter((g) => g.country === c).length})
            </option>
          ))}
        </Select>
        <Select aria-label="University" value={college} onChange={(e) => setCollege(e.target.value)}>
          <option value="">All universities</option>
          {colleges.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9" aria-label="Search course" placeholder="Course, e.g. Computer Science" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {filtered && (
          <Button variant="secondary" onClick={() => { setCountry(""); setCollege(""); setQ(""); }}>
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>
      <p className="mb-2 text-label text-muted">
        {shown.length} of {guides.length} guide{guides.length === 1 ? "" : "s"}
      </p>

      {shown.length === 0 ? (
        <Card>
          <Empty title={guides.length ? "No guides match" : "No alumni guides yet"}>
            {guides.length ? "Try another country or university, or clear the filters." : "Alumni appear here when they tick “Be a MyCareerZ alumni guide”."}
          </Empty>
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {shown.map((u) => {
            const r = latest(u.id);
            return (
              <div key={u.id} className="flex flex-wrap items-center gap-3 px-5 py-4 text-sm">
                <Avatar name={u.name} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-muted">
                    {[u.course, u.college, u.country].filter(Boolean).join(" · ")} · Batch {u.batch}
                  </p>
                  {r && (
                    <p className="mt-1 text-label text-muted">
                      {r.studentId ? `For ${nameOf(r.studentId)} · ` : ""}
                      {r.status === "requested" ? `asked ${timeAgo(r.at)}, waiting for ${campusName(r.campusId)} alumni office` : r.reply ? `“${r.reply}”` : `handled ${timeAgo(r.handledAt ?? r.at)}`}
                    </p>
                  )}
                </div>
                {r && <Pill tone={introPill[r.status].tone}>{introPill[r.status].label}</Pill>}
                <Button size="sm" variant={r?.status === "requested" ? "secondary" : "primary"} onClick={() => { setAsking(u); setForm({ studentId: "", reason: "" }); setErr(""); setDone(""); }}>
                  <Handshake className="h-4 w-4" /> {r ? "Ask again" : "Introduce"}
                </Button>
              </div>
            );
          })}
        </Card>
      )}

      <Modal
        open={!!asking}
        onClose={() => setAsking(null)}
        title={asking ? `Introduction to ${asking.name}` : ""}
        footer={
          done ? (
            <Button onClick={() => setAsking(null)}>Done</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setAsking(null)}>
                Cancel
              </Button>
              <Button
                disabled={form.reason.trim().length < 10}
                onClick={() => {
                  if (!asking) return;
                  const r = requestGuideIntro(asking.id, me.id, form.reason, form.studentId || undefined);
                  if (r.ok) setDone(`Sent to the ${campusName(asking.campusIds[0])} alumni office. You'll get an email when they reply.`);
                  else setErr(r.error ?? "");
                }}
              >
                Send request
              </Button>
            </>
          )
        }
      >
        {asking &&
          (done ? (
            <Callout tone="success" title="Request sent">
              {done}
            </Callout>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                {[asking.course, asking.college, asking.country].filter(Boolean).join(" · ")}. The request goes to the {campusName(asking.campusIds[0])} alumni office, who check with {asking.name.split(" ")[0]} and connect you.
              </p>
              <Field label="For a student (optional)" htmlFor="gi-student" hint="Only your consented students. The alumni office sees the name; the guide isn't told it.">
                <Select id="gi-student" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                  <option value="">General, not for one student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · Class {s.className}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Why this guide?" htmlFor="gi-reason" hint="At least 10 characters. The alumni office and the guide will read this.">
                <Textarea
                  id="gi-reason"
                  rows={3}
                  value={form.reason}
                  onChange={(e) => { setForm({ ...form, reason: e.target.value }); setErr(""); }}
                  placeholder="e.g. Class 11 student set on CS in the UK; a 20-minute call about Imperial's admissions and life in London would help."
                />
              </Field>
              {err && <p className="text-sm font-semibold text-danger">{err}</p>}
            </div>
          ))}
      </Modal>
    </>
  );
}
