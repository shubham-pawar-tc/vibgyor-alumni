"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CalendarPlus, Check, Clock, ExternalLink, Globe2, MapPin, Users, Video } from "lucide-react";
import { Gate } from "@/components/Gate";
import { Button, Callout, Card, Empty, Modal, PageHeader, Pill, Req, Tabs } from "@/components/ui";
import { campusName } from "@/lib/data";
import { googleCalUrl, icsFor } from "@/lib/community";
import { useStore } from "@/lib/store";
import type { RsvpStatus, VaaEvent } from "@/lib/types";
import { cn, firstName } from "@/lib/utils";

export default function EventsPage() {
  return (
    <Gate roles={["ALU", "STU", "PAR"]}>
      <Events />
    </Gate>
  );
}

const kindTone: Record<VaaEvent["kind"], "primary" | "info" | "success" | "warning"> = {
  Reunion: "primary",
  Webinar: "info",
  "Career talk": "success",
  Meetup: "warning",
};

function downloadIcs(e: VaaEvent) {
  const blob = new Blob([icsFor(e)], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${e.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** "Join now" opens this many minutes before an online event starts. */
const JOIN_OPENS_MIN = 15;

function untilText(ms: number) {
  const m = Math.ceil(ms / 60_000);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ${m % 60} min`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ${h % 24} h`;
}

function Events() {
  const { me, state, rsvp, joinEvent } = useStore();
  const [tab, setTab] = useState<"upcoming" | "mine">("upcoming");
  const [joining, setJoining] = useState<VaaEvent | null>(null);
  // Re-render every 20 s so "Join now" switches on (and off) by itself.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 20_000);
    return () => clearInterval(t);
  }, []);
  if (!me) return null;
  const role = me.role as "ALU" | "STU" | "PAR";
  const studentLocked = me.role === "STU" && me.studentStatus !== "active";

  // Parents see events for every child's campus, not just their own record's campus.
  const kids = me.role === "PAR" ? (me.childIds ?? []).map((id) => state.users.find((u) => u.id === id)).filter((u): u is NonNullable<typeof u> => !!u) : [];
  const myCampuses = me.role === "PAR" ? Array.from(new Set([...kids.flatMap((k) => k.campusIds), ...me.campusIds])) : [me.campusIds[0]];
  const forKids = (e: VaaEvent) => (e.campusIds === "all" ? [] : kids.filter((k) => k.campusIds.some((c) => (e.campusIds as string[]).includes(c))));
  const mineList = state.events.filter(
    (e) =>
      e.audience.includes(role) &&
      (e.campusIds === "all" || e.campusIds.some((c) => myCampuses.includes(c))) &&
      // Chapter Lead batch events: only that batch
      (!e.groupId?.startsWith("batch:") || Number(e.groupId.split(":")[2]) === me.batch)
  );
  const list = mineList
    .filter((e) => tab === "upcoming" || e.rsvps.some((r) => r.userId === me.id && r.status !== "no"))
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const myCount = mineList.filter((e) => e.rsvps.some((r) => r.userId === me.id && r.status !== "no")).length;

  return (
    <>
      <PageHeader eyebrow={<Req ids="G1 · G2" />} title="Events" description="Reunions, webinars, career talks and city meetups." />
      {me.role === "STU" && (
        <Callout tone="safe" className="mb-5">
          You only see events your campus has opened to students. Talks happen in school or online with teachers present.
        </Callout>
      )}
      {studentLocked && (
        <Callout tone="warning" className="mb-5">
          You can sign up for events once your parent gives consent.
        </Callout>
      )}
      <div className="mb-4">
        <Tabs
          tabs={[
            { id: "upcoming", label: "Upcoming" },
            { id: "mine", label: "I'm going", count: myCount },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {list.length === 0 ? (
        <Card>
          <Empty icon={<CalendarDays className="h-6 w-6" />} title={tab === "mine" ? "You haven't signed up for anything" : "No upcoming events"} />
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((e) => {
            const d = new Date(e.start);
            const mine = e.rsvps.find((r) => r.userId === me.id);
            const going = e.rsvps.filter((r) => r.status === "going");
            const seats = going.reduce((n, r) => n + 1 + (r.guests ?? 0), 0);
            const full = seats >= e.capacity && mine?.status !== "going";
            return (
              <Card key={e.id} className="flex flex-col overflow-hidden sm:flex-row">
                <div className="flex shrink-0 flex-row items-center gap-3 bg-primary-soft px-5 py-3 text-primary sm:w-28 sm:flex-col sm:justify-center sm:gap-0 sm:py-5">
                  <span className="text-[13px] font-bold uppercase tracking-wider">{d.toLocaleDateString("en-IN", { month: "short" })}</span>
                  <span className="text-3xl font-bold leading-none">{d.getDate()}</span>
                  <span className="text-[13px] font-medium">{d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                </div>
                <div className="min-w-0 flex-1 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={kindTone[e.kind]}>{e.kind}</Pill>
                    {e.online && nowMs >= Date.parse(e.start) && nowMs < Date.parse(e.end) && (
                      <Pill tone="danger" icon={<span className="h-2 w-2 animate-pulse rounded-full bg-current" />}>
                        Live now
                      </Pill>
                    )}
                    <span className="text-[13.5px] text-muted">{e.campusIds === "all" ? "All campuses" : campusName(e.campusIds[0])}</span>
                    {kids.length > 1 && forKids(e).length > 0 && <Pill tone="info">For {forKids(e).map((k) => firstName(k.name)).join(" & ")}&apos;s campus</Pill>}
                    {mine?.status === "going" && (
                      <Pill tone="success" icon={<Check className="h-3 w-3" />}>
                        You&apos;re going{mine.guests ? ` +${mine.guests}` : ""}
                      </Pill>
                    )}
                  </div>
                  <h3 className="mt-2 text-[17px] font-semibold leading-snug">{e.title}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-muted">
                    <span>
                      {d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}–{new Date(e.end).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })} IST
                    </span>
                    <span className="flex items-center gap-1">
                      {e.online ? <Globe2 className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />} {e.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {seats} / {e.capacity} going
                    </span>
                  </div>
                  <p className="mt-3 text-[14.5px] leading-relaxed">{e.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <div className="flex overflow-hidden rounded-xl border border-border">
                      {(
                        [
                          ["going", "Going"],
                          ["maybe", "Maybe"],
                          ["no", "Can't go"],
                        ] as [RsvpStatus, string][]
                      ).map(([s, label]) => (
                        <button
                          key={s}
                          disabled={studentLocked || (s === "going" && full)}
                          onClick={() => rsvp(e.id, me.id, s, s === "going" ? mine?.guests : undefined)}
                          className={cn(
                            "h-9 border-r border-border px-3.5 text-[14px] font-semibold last:border-r-0 disabled:opacity-40",
                            mine?.status === s ? (s === "going" ? "bg-success text-white" : s === "maybe" ? "bg-warning-soft text-warning" : "bg-surface-2") : "hover:bg-surface-2"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {e.kind === "Reunion" && mine?.status === "going" && (
                      <label className="flex items-center gap-2 text-[14px]">
                        <input type="checkbox" checked={!!mine.guests} onChange={(ev) => rsvp(e.id, me.id, "going", ev.target.checked ? 1 : 0)} className="h-4 w-4 accent-[var(--primary)]" />
                        Bringing a +1
                      </label>
                    )}
                    {full && <span className="text-[13.5px] font-medium text-danger">Full</span>}
                    <span className="flex-1" />
                    {e.online && (
                      <JoinButton
                        e={e}
                        nowMs={nowMs}
                        going={mine?.status === "going"}
                        locked={studentLocked}
                        onJoin={() => {
                          joinEvent(e.id, me.id);
                          setJoining(e);
                        }}
                      />
                    )}
                    {mine?.status === "going" && (
                      <div className="flex gap-1">
                        <button onClick={() => downloadIcs(e)} className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-[14px] font-semibold text-primary hover:bg-primary-soft">
                          <CalendarPlus className="h-4 w-4" /> Add to calendar (.ics)
                        </button>
                        <a href={googleCalUrl(e)} target="_blank" rel="noreferrer" className="flex h-9 items-center rounded-xl px-3 text-[14px] font-semibold text-muted hover:bg-surface-2">
                          Google
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!joining}
        onClose={() => setJoining(null)}
        title="Joining the webinar"
        footer={
          <>
            <Button variant="secondary" onClick={() => setJoining(null)}>
              Close
            </Button>
            {joining?.joinUrl && (
              <a
                href={joining.joinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-primary-fg hover:brightness-110"
              >
                <ExternalLink className="h-4 w-4" /> Open webinar room
              </a>
            )}
          </>
        }
      >
        {joining && (
          <div className="space-y-3 text-[14.5px]">
            <p className="font-semibold">{joining.title}</p>
            <p className="text-muted">Your attendance is recorded. In the live platform this opens the webinar room (for example Zoom, Teams or YouTube Live) in a new tab.</p>
            <p className="break-all rounded-xl bg-surface-2 px-3 py-2 font-mono text-[13px]">{joining.joinUrl ?? "Link to be added by the campus"}</p>
            {me.role === "STU" && <Callout tone="safe">Your camera and microphone stay off for students. Questions go through the chat and are moderated by the campus.</Callout>}
          </div>
        )}
      </Modal>
    </>
  );
}

/** Online events only: disabled with a countdown until JOIN_OPENS_MIN before start, live until the end, then "Ended". */
function JoinButton({ e, nowMs, going, locked, onJoin }: { e: VaaEvent; nowMs: number; going: boolean; locked: boolean; onJoin: () => void }) {
  const start = Date.parse(e.start);
  const end = Date.parse(e.end);
  const opens = start - JOIN_OPENS_MIN * 60_000;
  const base = "flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-[14px] font-semibold";

  if (nowMs >= end)
    return (
      <span className={`${base} bg-surface-2 text-muted`}>
        <Video className="h-4 w-4" /> Ended
      </span>
    );
  if (nowMs < opens)
    return (
      <span className={`${base} cursor-not-allowed bg-surface-2 text-muted`} title={`Join opens ${JOIN_OPENS_MIN} minutes before the start`}>
        <Clock className="h-4 w-4" /> Join opens in {untilText(opens - nowMs)}
      </span>
    );
  if (locked)
    return (
      <span className={`${base} cursor-not-allowed bg-surface-2 text-muted`} title="Needs parent consent">
        <Video className="h-4 w-4" /> Join now
      </span>
    );
  if (!going)
    return (
      <span className={`${base} bg-warning-soft text-warning`} title="The link goes to registered attendees">
        <Video className="h-4 w-4" /> Tap &quot;Going&quot; to join
      </span>
    );
  return (
    <button onClick={onJoin} className={`${base} bg-success text-white shadow-card hover:brightness-110`}>
      <Video className="h-4 w-4" /> {nowMs >= start ? "Join now" : `Join now · starts in ${untilText(start - nowMs)}`}
    </button>
  );
}
