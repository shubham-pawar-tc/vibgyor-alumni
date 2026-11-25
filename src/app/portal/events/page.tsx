"use client";

import { useState } from "react";
import { CalendarDays, CalendarPlus, Check, Globe2, MapPin, Users } from "lucide-react";
import { Gate } from "@/components/Gate";
import { Callout, Card, Empty, PageHeader, Pill, Req, Tabs } from "@/components/ui";
import { campusName } from "@/lib/data";
import { googleCalUrl, icsFor } from "@/lib/community";
import { useStore } from "@/lib/store";
import type { RsvpStatus, VaaEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

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

function Events() {
  const { me, state, rsvp } = useStore();
  const [tab, setTab] = useState<"upcoming" | "mine">("upcoming");
  if (!me) return null;
  const role = me.role as "ALU" | "STU" | "PAR";
  const studentLocked = me.role === "STU" && me.studentStatus !== "active";

  const mineList = state.events.filter((e) => e.audience.includes(role) && (e.campusIds === "all" || e.campusIds.includes(me.campusIds[0])));
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
                  <span className="text-[12px] font-bold uppercase tracking-wider">{d.toLocaleDateString("en-IN", { month: "short" })}</span>
                  <span className="text-3xl font-bold leading-none">{d.getDate()}</span>
                  <span className="text-[12px] font-medium">{d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                </div>
                <div className="min-w-0 flex-1 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={kindTone[e.kind]}>{e.kind}</Pill>
                    <span className="text-[12.5px] text-muted">{e.campusIds === "all" ? "All campuses" : campusName(e.campusIds[0])}</span>
                    {mine?.status === "going" && (
                      <Pill tone="success" icon={<Check className="h-3 w-3" />}>
                        You&apos;re going{mine.guests ? ` +${mine.guests}` : ""}
                      </Pill>
                    )}
                  </div>
                  <h3 className="mt-2 text-[17px] font-semibold leading-snug">{e.title}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
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
                  <p className="mt-3 text-[13.5px] leading-relaxed">{e.description}</p>

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
                            "h-9 border-r border-border px-3.5 text-[13px] font-semibold last:border-r-0 disabled:opacity-40",
                            mine?.status === s ? (s === "going" ? "bg-success text-white" : s === "maybe" ? "bg-warning-soft text-warning" : "bg-surface-2") : "hover:bg-surface-2"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {e.kind === "Reunion" && mine?.status === "going" && (
                      <label className="flex items-center gap-2 text-[13px]">
                        <input type="checkbox" checked={!!mine.guests} onChange={(ev) => rsvp(e.id, me.id, "going", ev.target.checked ? 1 : 0)} className="h-4 w-4 accent-[var(--primary)]" />
                        Bringing a +1
                      </label>
                    )}
                    {full && <span className="text-[12.5px] font-medium text-danger">Full</span>}
                    <span className="flex-1" />
                    {mine?.status === "going" && (
                      <div className="flex gap-1">
                        <button onClick={() => downloadIcs(e)} className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold text-primary hover:bg-primary-soft">
                          <CalendarPlus className="h-4 w-4" /> Add to calendar (.ics)
                        </button>
                        <a href={googleCalUrl(e)} target="_blank" rel="noreferrer" className="flex h-9 items-center rounded-xl px-3 text-[13px] font-semibold text-muted hover:bg-surface-2">
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
    </>
  );
}
