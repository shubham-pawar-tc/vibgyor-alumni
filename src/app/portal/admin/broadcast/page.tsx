"use client";

import { useMemo, useState } from "react";
import { AnimatedBar } from "@/components/motion";
import { Bell, CalendarClock, Check, Loader2, Lock, Mail, Megaphone, MessageCircle, MessageSquareText, Plus, Send, Users } from "lucide-react";
import { Button, Callout, Card, CardHeader, Field, Input, PageHeader, Pill, Req, Select, Tabs, Textarea } from "@/components/ui";
import { AdminOnly, NoPermission } from "@/components/admin";
import { campuses, campusName, countries, population, waTemplates } from "@/lib/data";
import { can, useStore } from "@/lib/store";
import type { Broadcast, Channel } from "@/lib/types";
import { cn, fmt, formatDateTime, timeAgo } from "@/lib/utils";

const channelInfo: Record<Channel, { label: string; icon: typeof Mail; note: string }> = {
  email: { label: "Email", icon: Mail, note: "From alumni@vibgyor domain · SPF/DKIM/DMARC" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, note: "Approved templates only · VIBGYOR-owned number" },
  push: { label: "Push / in-app", icon: Bell, note: "Web push now, app push from Release 3" },
  sms: { label: "SMS", icon: MessageSquareText, note: "Alerts only, arrives in Release 2" },
};

const years = Array.from({ length: 2026 - 2004 + 1 }, (_, i) => 2004 + i);

function Composer({ onDone }: { onDone: () => void }) {
  const { me, createBroadcast } = useStore();
  const group = me?.role === "GAO" || me?.role === "SAD";
  const [campus, setCampus] = useState<string>(group ? "all" : me!.campusIds[0]);
  const [batchFrom, setBatchFrom] = useState(2004);
  const [batchTo, setBatchTo] = useState(2018);
  const [country, setCountry] = useState("all");
  const [segment, setSegment] = useState<"all_verified" | "mentors">("all_verified");
  const [channels, setChannels] = useState<Channel[]>(["email", "whatsapp"]);
  const [title, setTitle] = useState("Annual Alumni Reunion 2026");
  const [subject, setSubject] = useState("You're invited: VIBGYOR Alumni Reunion, Saturday 20 December");
  const [body, setBody] = useState(
    "Dear {{first_name}},\n\nIt's that time of year again. Join your batchmates and teachers back on campus for an evening of food, music and memories.\n\nSaturday 20 December · 6 pm onwards\n\nRSVP in the VAA app so we can plan for you.\n\nWarm regards,\nVIBGYOR Alumni Association"
  );
  const [tpl, setTpl] = useState(waTemplates[0].id);
  const [when, setWhen] = useState<"now" | "later">("now");
  const [at, setAt] = useState("2026-11-28T10:00");
  const [preview, setPreview] = useState<"email" | "whatsapp" | "push">("whatsapp");

  const scopeIdx = useMemo(() => {
    if (campus === "all") return null;
    return campuses.findIndex((c) => c.id === campus);
  }, [campus]);

  const aud = useMemo(() => {
    const rows = population.filter(
      (p) =>
        p.verified &&
        (scopeIdx === null || p.campusIdx === scopeIdx) &&
        p.batch >= batchFrom &&
        p.batch <= batchTo &&
        (country === "all" || (country === "abroad" ? p.countryIdx !== 0 : countries[p.countryIdx] === country)) &&
        (segment === "all_verified" || p.mentor)
    );
    return {
      total: rows.length,
      email: rows.filter((r) => r.emailOk).length,
      whatsapp: rows.filter((r) => r.waOptIn).length,
      push: rows.filter((r) => r.push).length,
    };
  }, [scopeIdx, batchFrom, batchTo, country, segment]);

  const template = waTemplates.find((t) => t.id === tpl)!;
  const campusLabel = campus === "all" ? "VIBGYOR" : campusName(campus).split(",")[0];
  const waText = template.body
    .replace("{{first_name}}", "Karan")
    .replace("{{campus}}", campusLabel)
    .replace("{{date}}", "Sat 20 Dec")
    .replace("{{event_name}}", title);

  const toggle = (c: Channel) => setChannels((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  const valid = channels.length > 0 && aud.total > 0 && title.trim() && subject.trim() && body.trim();

  const submit = () => {
    const b: Omit<Broadcast, "id" | "createdAt" | "status" | "stats"> = {
      title,
      createdBy: me!.id,
      campusIds: campus === "all" ? "all" : [campus],
      batchFrom,
      batchTo,
      countries: country === "all" ? "all" : [country],
      segment,
      channels,
      waTemplate: channels.includes("whatsapp") ? tpl : undefined,
      subject,
      body: channels.includes("whatsapp") && !channels.includes("email") ? waText : body,
      audience: aud.total,
      reach: Object.fromEntries(channels.map((c) => [c, aud[c as "email" | "whatsapp" | "push"] ?? 0])),
      scheduledFor: when === "later" ? new Date(at).toISOString() : undefined,
    };
    createBroadcast(b);
    onDone();
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_1fr]">
      <div className="space-y-5">
        {/* Audience */}
        <Card>
          <CardHeader title="1 · Audience" subtitle="Verified, opted-in adult alumni only" icon={<Users className="h-[18px] w-[18px]" />} />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Campus" htmlFor="campus" hint={group ? "Group office can target any campus." : "Locked to your campus."}>
              {group ? (
                <Select id="campus" value={campus} onChange={(e) => setCampus(e.target.value)}>
                  <option value="all">All 39 campuses</option>
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.city}
                    </option>
                  ))}
                </Select>
              ) : (
                <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 text-sm">
                  <Lock className="h-3.5 w-3.5 text-muted" /> {campusName(campus)}
                </div>
              )}
            </Field>
            <Field label="Segment" htmlFor="seg">
              <Select id="seg" value={segment} onChange={(e) => setSegment(e.target.value as typeof segment)}>
                <option value="all_verified">All verified alumni</option>
                <option value="mentors">Mentors only</option>
              </Select>
            </Field>
            <Field label="Batches" htmlFor="bf">
              <div className="flex items-center gap-2">
                <Select id="bf" value={batchFrom} onChange={(e) => setBatchFrom(Number(e.target.value))} aria-label="From batch">
                  {years.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </Select>
                <span className="text-muted">to</span>
                <Select value={batchTo} onChange={(e) => setBatchTo(Number(e.target.value))} aria-label="To batch">
                  {years.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </Select>
              </div>
            </Field>
            <Field label="Where they live" htmlFor="ct">
              <Select id="ct" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="all">Anywhere</option>
                <option value="abroad">Outside India</option>
                {countries.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="px-5 pb-5">
            <Callout tone="safe">Students and anyone under 18 are never included in broadcasts or marketing messages.</Callout>
          </div>
        </Card>

        {/* Channels */}
        <Card>
          <CardHeader title="2 · Channels" subtitle="Opt-outs are removed automatically" icon={<Megaphone className="h-[18px] w-[18px]" />} />
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {(Object.keys(channelInfo) as Channel[]).map((c) => {
              const I = channelInfo[c].icon;
              const disabled = c === "sms";
              const on = channels.includes(c);
              return (
                <button
                  key={c}
                  disabled={disabled}
                  onClick={() => toggle(c)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    on ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary/40"
                  )}
                >
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", on ? "bg-primary text-primary-fg" : "bg-surface-2 text-muted")}>
                    <I className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{channelInfo[c].label}</span>
                      {on && <Check className="h-4 w-4 text-primary" />}
                    </span>
                    <span className="mt-0.5 block text-label text-muted">{channelInfo[c].note}</span>
                    {c !== "sms" && <span className="mt-2 block text-label font-semibold tabular-nums">{fmt(aud[c as "email" | "whatsapp" | "push"])} reachable</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Message */}
        <Card>
          <CardHeader title="3 · Message" icon={<Mail className="h-[18px] w-[18px]" />} />
          <div className="space-y-4 p-5">
            <Field label="Internal name" htmlFor="t">
              <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Email subject / push title" htmlFor="s">
              <Input id="s" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
            <Field label="Email body" htmlFor="b" hint={<>Use <code className="rounded bg-surface-2 px-1">{"{{first_name}}"}</code> to personalise. An unsubscribe link is added automatically.</>}>
              <Textarea id="b" rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
            {channels.includes("whatsapp") && (
              <Field label="WhatsApp template" htmlFor="tpl" hint="WhatsApp only allows pre-approved templates for broadcasts.">
                <Select id="tpl" value={tpl} onChange={(e) => setTpl(e.target.value)}>
                  {waTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} · {t.id}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader title="4 · Schedule" icon={<CalendarClock className="h-[18px] w-[18px]" />} />
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Tabs
                tabs={[
                  { id: "now", label: "Send now" },
                  { id: "later", label: "Schedule" },
                ]}
                value={when}
                onChange={setWhen}
              />
            </div>
            {when === "later" && <Input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} className="sm:max-w-[240px]" aria-label="Send at" />}
          </div>
        </Card>
      </div>

      {/* Summary + preview */}
      <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <Card className="p-5">
          <p className="text-sm font-medium text-muted">Audience</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{fmt(aud.total)}</p>
          <p className="text-sm text-muted">
            verified alumni · {campus === "all" ? "all campuses" : campusName(campus).split(",")[0]} · batches {batchFrom}–{batchTo}
          </p>
          <div className="mt-4 space-y-3">
            {(["email", "whatsapp", "push"] as const).map((c) => {
              const pct = aud.total ? (aud[c] / aud.total) * 100 : 0;
              const on = channels.includes(c);
              return (
                <div key={c} className={cn(!on && "opacity-40")}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{channelInfo[c].label}</span>
                    <span className="tabular-nums">
                      {fmt(aud[c])} <span className="text-muted">· {fmt(aud.total - aud[c])} opted out / no consent</span>
                    </span>
                  </div>
                  <AnimatedBar value={pct} trackClassName="mt-1 h-1.5" />
                </div>
              );
            })}
          </div>
          <Button size="lg" className="mt-5 w-full" disabled={!valid} onClick={submit}>
            {when === "now" ? <Send className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
            {when === "now" ? `Send to ${fmt(aud.total)} alumni` : "Schedule broadcast"}
          </Button>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-border p-3">
            <Tabs
              tabs={[
                { id: "whatsapp", label: "WhatsApp" },
                { id: "email", label: "Email" },
                { id: "push", label: "Push" },
              ]}
              value={preview}
              onChange={setPreview}
            />
          </div>
          <div className="bg-surface-2 p-5">
            <div className="mx-auto w-full max-w-[290px] rounded-2xl border-[6px] border-text/85 bg-bg p-3 shadow-lg">
              <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-text/20" />
              {preview === "whatsapp" && (
                <div className="rounded-xl bg-[#e7f7e2] p-3 text-sm leading-relaxed text-[#111] dark:bg-[#1f3b2a] dark:text-[#e9f5ec]">
                  <p className="mb-1 text-xs font-semibold text-[#128c4b] dark:text-[#5fd394]">VIBGYOR Alumni ✓</p>
                  {waText}
                  <div className="mt-2 rounded-xl bg-white/70 py-2 text-center text-label font-semibold text-[#128c4b] dark:bg-black/20 dark:text-[#5fd394]">RSVP</div>
                </div>
              )}
              {preview === "email" && (
                <div className="rounded-xl bg-surface p-3 text-label leading-relaxed">
                  <p className="font-semibold">{subject}</p>
                  <p className="mt-2 line-clamp-[10] whitespace-pre-line text-muted">{body.replace(/{{first_name}}/g, "Karan")}</p>
                  <p className="mt-2 text-xs text-muted underline">Unsubscribe</p>
                </div>
              )}
              {preview === "push" && (
                <div className="flex gap-3 rounded-xl bg-surface p-3 shadow">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-label font-semibold text-primary-fg">V</span>
                  <div className="min-w-0">
                    <p className="text-label font-semibold">VIBGYOR Alumni</p>
                    <p className="line-clamp-2 text-label text-muted">{subject}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function History() {
  const { state } = useStore();
  const me = state.users.find((u) => u.id === state.currentUserId)!;
  const group = me.role === "GAO" || me.role === "SAD";
  const list = state.broadcasts.filter((b) => group || (b.campusIds !== "all" && b.campusIds.some((c) => me.campusIds.includes(c))));
  if (!list.length)
    return (
      <Card className="p-10 text-center text-sm text-muted">
        No broadcasts yet.
      </Card>
    );
  return (
    <div className="space-y-4">
      {list.map((b) => (
        <Card key={b.id} className="animate-in p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{b.title}</p>
                {b.status === "delivered" && <Pill tone="success">Delivered</Pill>}
                {b.status === "sending" && (
                  <Pill tone="info" icon={<Loader2 className="h-3 w-3 animate-spin" />}>
                    Sending
                  </Pill>
                )}
                {b.status === "scheduled" && <Pill tone="warning">Scheduled {b.scheduledFor && formatDateTime(b.scheduledFor)}</Pill>}
              </div>
              <p className="mt-1 text-sm text-muted">
                {fmt(b.audience)} alumni · {b.campusIds === "all" ? "All campuses" : b.campusIds.map((c) => campusName(c).split(",")[0]).join(", ")} · batches {b.batchFrom}–{b.batchTo} · by{" "}
                {state.users.find((u) => u.id === b.createdBy)?.name} · {timeAgo(b.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              {b.channels.map((c) => {
                const I = channelInfo[c].icon;
                return (
                  <span key={c} className="grid h-8 w-8 place-items-center rounded-xl bg-surface-2 text-muted" title={channelInfo[c].label}>
                    <I className="h-4 w-4" />
                  </span>
                );
              })}
            </div>
          </div>
          {b.stats && (
            <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {b.channels.map((c) => {
                const s = b.stats?.[c];
                if (!s) return null;
                return (
                  <div key={c} className="rounded-xl bg-surface-2 p-4">
                    <p className="text-label font-semibold">{channelInfo[c].label}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                      {[
                        ["Delivered", s.delivered, s.sent],
                        [c === "whatsapp" ? "Read" : "Opened", s.opened, s.delivered],
                        ["Clicked", s.clicked, s.delivered],
                      ].map(([l, v, base]) => (
                        <div key={l as string}>
                          <p className="text-body font-semibold tabular-nums">{fmt(v as number)}</p>
                          <p className="text-xs text-muted">
                            {l} · {base ? Math.round(((v as number) / (base as number)) * 100) : 0}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export default function BroadcastPage() {
  const { me, state } = useStore();
  const canSend = can(state, me, "broadcast.send");
  const [composing, setComposing] = useState(false);
  return (
    <AdminOnly me={me}>
      <PageHeader
        eyebrow={<div className="flex flex-wrap gap-2"><Req ids="D4" /> <Req ids="D5" /> <Req ids="D7" /> <Req ids="INT-2" /> <Req ids="INT-3" /> <Req ids="CS-10" /></div>}
        title={composing ? "New broadcast" : "Broadcasts"}
        description={composing ? "Reach alumni by email, WhatsApp and push, honouring every opt-out." : "Campaigns sent to alumni, with delivery and engagement."}
        actions={
          composing ? (
            <Button variant="secondary" onClick={() => setComposing(false)}>
              Cancel
            </Button>
          ) : canSend ? (
            <Button onClick={() => setComposing(true)}>
              <Plus className="h-4 w-4" /> New broadcast
            </Button>
          ) : (
            <NoPermission what="send broadcasts" />
          )
        }
      />
      {composing && canSend ? <Composer onDone={() => setComposing(false)} /> : <History />}
    </AdminOnly>
  );
}
