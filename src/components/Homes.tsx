"use client";

import Link from "next/link";
import { useState } from "react";
import { AskMentorPermission } from "./AskMentorPermission";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock,
  Compass,
  GraduationCap,
  HeartHandshake,
  Lock,
  Megaphone,
  MessagesSquare,
  PauseCircle,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { campuses, campusName, consentPurposes, population, roleLabels } from "@/lib/data";
import { activeBadge, belowAgeGate, hasConsent, latestConsent, useStore } from "@/lib/store";
import type { ConsentPurpose, User } from "@/lib/types";
import { cn, firstName, fmt, formatDate, timeAgo } from "@/lib/utils";
import { completeness, groupsFor } from "@/lib/community";
import { pageIconFor } from "@/lib/pageIcons";
import { Avatar, Button, Callout, Card, CardHeader, PageHeader, Pill, Req, Stat } from "./ui";

/* ================================ Student ================================ */

export function StudentHome({ me }: { me: User }) {
  const { state, requestConsent } = useStore();
  const parents = (me.parentIds ?? []).map((id) => state.users.find((u) => u.id === id)).filter((u): u is User => !!u);
  const parentNames = parents.length ? parents.map((p) => p.name).join(" and ") : undefined;
  const sentRecently = state.outbox.some((o) => parents.some((p) => p.id === o.toUserId) && o.link?.href.startsWith(`/consent/${me.id}`));

  if (belowAgeGate(state, me)) {
    const min = state.campusMinClass?.[me.campusIds[0]] ?? 8;
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 text-center">
          <Lock className="mx-auto h-10 w-10 text-muted" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Not open for your class yet, {firstName(me.name)}</h1>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
            {campusName(me.campusIds[0])} opens the VIBGYOR Alumni Platform to students from <b>Class {min}</b>. You&apos;re in Class {me.className}, so your account stays switched off and no one has been asked for consent.
          </p>
          <p className="mt-4 text-[13.5px] text-muted">We&apos;ll invite your parent when you reach Class {min}.</p>
        </Card>
      </div>
    );
  }

  if (me.studentStatus === "awaiting_consent" || me.studentStatus === "paused") {
    const paused = me.studentStatus === "paused";
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="overflow-hidden">
          <div className="relative bg-primary px-6 py-8 text-primary-fg sm:px-8">
            <div className="spectrum absolute inset-x-0 bottom-0 h-1" />
            {paused ? <PauseCircle className="h-10 w-10" /> : <Lock className="h-10 w-10" />}
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              {paused ? `Your account is paused, ${firstName(me.name)}` : `Hi ${firstName(me.name)}, you're nearly in`}
            </h1>
            <p className="mt-2 max-w-md text-[15px] opacity-85">
              {paused
                ? "Your parent has withdrawn permission for the platform. Talk to them if you think this is a mistake."
                : "Because you're under 18, a parent needs to say yes before your account is switched on. We've asked them already."}
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-1.5">
              <Req ids="CS-1" /> <Req ids="CS-2" />
            </div>
            <ol className="mt-5 space-y-4">
              {[
                { done: true, title: "Account created from school records", sub: `Class ${me.className} · ${campusName(me.campusIds[0])}` },
                { done: paused, title: `Consent request sent to ${parentNames ?? "your parent"}`, sub: "By SMS, WhatsApp and email to the number the school has" },
                { done: false, title: "Your parent confirms with a one-time code", sub: "They choose what you can do: platform, mentors, MyCareerZ" },
                { done: false, title: "You get full access", sub: "Find mentors, ask questions, join events" },
              ].map((s, i) => (
                <li key={i} className="flex gap-3">
                  {s.done || i === 0 ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" /> : i === 1 ? <Clock className="mt-0.5 h-5 w-5 shrink-0 text-warning" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-border" />}
                  <div>
                    <p className="text-[14px] font-semibold">{s.title}</p>
                    <p className="text-[14px] text-muted">{s.sub}</p>
                  </div>
                </li>
              ))}
            </ol>
            {!paused && (
              <div className="mt-7 flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => requestConsent(me.id, me.id)} size="lg" className="flex-1">
                  <Send className="h-4 w-4" /> {sentRecently ? "Ask my parent again" : "Ask my parent now"}
                </Button>
              </div>
            )}
            {sentRecently && !paused && (
              <Callout tone="success" className="mt-4">
                Sent to {parentNames}. Demo: open the <b>device simulator</b> (bottom right) and tap the consent link.
              </Callout>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const myConvs = state.conversations.filter((c) => c.studentId === me.id);
  const mentorOk = hasConsent(state, me.id, "mentor");

  return (
    <>
      <PageHeader
        eyebrow={<Pill tone="primary">Class {me.className} · {campusName(me.campusIds[0])}</Pill>}
        title={`Good to see you, ${firstName(me.name)}`}
        description="Get guidance from VIBGYOR alumni who studied what you want to study."
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-5">
          <Card className="relative overflow-hidden p-6">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10" />
            <Compass className="h-8 w-8 text-primary" />
            <h2 className="mt-3 text-lg font-bold">Find a mentor for your choices</h2>
            <p className="mt-1 max-w-md text-[14px] text-muted">We match you with alumni mentors by the country, course and college you&apos;re aiming for.</p>
            {mentorOk ? (
              <Button href="/portal/mentors" className="mt-5">
                <Search className="h-4 w-4" /> Browse mentors
              </Button>
            ) : (
              <Callout tone="warning" className="mt-5" title="Mentor contact is switched off">
                Your parent hasn&apos;t allowed mentor contact. Ask them to switch it on in their Parent portal.
                <div>
                  <AskMentorPermission me={me} />
                </div>
              </Callout>
            )}
          </Card>

          <Card>
            <CardHeader title="My 3C choices" subtitle="Country · Course · College" action={<Req ids="B10" />} />
            <div className="divide-y divide-border">
              {me.threeC?.map((c, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-[14px] font-bold text-primary">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold">{c.college}</p>
                    <p className="truncate text-[14px] text-muted">
                      {c.course} · {c.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Conversations" action={<Link href="/portal/messages" className="text-[14px] font-semibold text-primary">Open</Link>} />
            {myConvs.length === 0 ? (
              <p className="px-5 py-6 text-[14px] text-muted">No conversations yet. Ask a mentor your first question.</p>
            ) : (
              <div className="divide-y divide-border">
                {myConvs.map((c) => {
                  const m = state.users.find((u) => u.id === c.mentorId)!;
                  const last = state.messages.filter((x) => x.convId === c.id).at(-1);
                  return (
                    <Link key={c.id} href={`/portal/messages?c=${c.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2">
                      <Avatar name={m.name} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-semibold">{m.name}</p>
                        <p className="truncate text-[13.5px] text-muted">{last?.text}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[14px] font-semibold">What your parent allowed</p>
              <Req ids="CS-2" />
            </div>
            <div className="mt-3 space-y-2.5">
              {(Object.keys(consentPurposes) as ConsentPurpose[]).map((p) => {
                const on = hasConsent(state, me.id, p);
                const rec = latestConsent(state, me.id, p);
                const by = rec ? state.users.find((u) => u.id === rec.givenBy) : undefined;
                return (
                  <div key={p} className="rounded-xl bg-surface-2 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2 text-[14px]">
                      <span className="font-medium">{consentPurposes[p].short}</span>
                      {on ? <Pill tone="success">On</Pill> : <Pill>Off</Pill>}
                    </div>
                    {rec && (
                      <p className="mt-1 text-[12.5px] leading-snug text-muted">
                        {rec.status === "granted" ? "Allowed" : "Switched off"} by <span className="font-semibold text-text">{by?.name ?? "parent"}</span> on{" "}
                        {formatDate(rec.withdrawnAt ?? rec.at)}
                        {rec.status === "granted" && <> · ref <span className="font-mono">{rec.otpRef}</span></>}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[12.5px] text-muted">Only your parent can change these, from their Parent portal.</p>
          </Card>
          <Card className="p-5">
            <p className="text-[14px] font-semibold">Coming up for you</p>
            <div className="mt-3 grid gap-2">
              <Link href="/portal/events" className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-2.5 text-[14px] hover:bg-border/60">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="flex-1">Career talks and webinars</span>
                <span className="font-semibold">{state.events.filter((e) => e.audience.includes("STU") && (e.campusIds === "all" || e.campusIds.includes(me.campusIds[0]))).length}</span>
              </Link>
              <Link href="/portal/jobs" className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-2.5 text-[14px] hover:bg-border/60">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="flex-1">Internships approved by your campus</span>
                <span className="font-semibold">{state.jobs.filter((j) => j.forStudents && j.status === "approved").length}</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ================================ Parent ================================ */

export function ParentHome({ me }: { me: User }) {
  const { state } = useStore();
  const kids = (me.childIds ?? []).map((id) => state.users.find((u) => u.id === id)!).filter(Boolean);
  return (
    <>
      <PageHeader
        title={`Welcome, ${firstName(me.name)}`}
        description={kids.length > 1 ? `You control what each of your ${kids.length} children can do on the VIBGYOR Alumni Platform. Each child has separate permissions.` : "You control what your child can do on the VIBGYOR Alumni Platform."}
      />
      {kids.length > 1 && kids.some((k) => k.studentStatus === "awaiting_consent") && (
        <Callout tone="warning" className="mb-5" title={`${kids.filter((k) => k.studentStatus === "awaiting_consent").length} of your children ${kids.filter((k) => k.studentStatus === "awaiting_consent").length === 1 ? "is" : "are"} waiting for your permission`}>
          {kids
            .filter((k) => k.studentStatus === "awaiting_consent")
            .map((k, i) => (
              <span key={k.id}>
                {i > 0 && " · "}
                <Link href={`/consent/${k.id}?p=${me.id}`} className="font-semibold text-primary underline">
                  Review for {firstName(k.name)}
                </Link>
              </span>
            ))}
        </Callout>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {kids.map((k) => {
          const waiting = k.studentStatus === "awaiting_consent";
          return (
            <Card key={k.id} className="p-6">
              <div className="flex items-center gap-4">
                <Avatar name={k.name} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold">{k.name}</p>
                  <p className="text-[14px] text-muted">
                    Class {k.className} · {campusName(k.campusIds[0])}
                  </p>
                </div>
                <StatusPill status={k.studentStatus} />
              </div>
              <div className="mt-5 space-y-2">
                {(Object.keys(consentPurposes) as ConsentPurpose[]).map((p) => (
                  <div key={p} className="flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5 text-[14.5px]">
                    <span>{consentPurposes[p].short}</span>
                    {hasConsent(state, k.id, p) ? <Pill tone="success">Allowed</Pill> : <Pill>Not allowed</Pill>}
                  </div>
                ))}
              </div>
              {waiting ? (
                <Button href={`/consent/${k.id}?p=${me.id}`} className="mt-5 w-full">
                  Review consent request{kids.length > 1 ? ` for ${firstName(k.name)}` : ""}
                </Button>
              ) : (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <Button href={`/portal/consent?child=${k.id}`} variant="secondary" className="w-full">
                    Manage {kids.length > 1 ? `${firstName(k.name)}'s ` : ""}permissions
                  </Button>
                  <Button href={`/portal/child-chats?child=${k.id}`} variant="secondary" className="w-full">
                    Mentor chats ({state.conversations.filter((c) => c.studentId === k.id).length})
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
        <Card className="p-6">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <p className="mt-3 font-semibold">How we keep your child safe</p>
          <ul className="mt-3 space-y-2.5 text-[14.5px] text-muted">
            <li>• Only approved alumni mentors can be contacted</li>
            <li>• All messages are recorded and reviewed by the campus</li>
            <li>• You can read your child&apos;s mentor conversations and message the mentor yourself</li>
            <li>• Phone numbers, emails and links are hidden automatically</li>
            <li>• No advertising or tracking for under-18s</li>
          </ul>
        </Card>
      </div>
    </>
  );
}

export function StatusPill({ status }: { status?: User["studentStatus"] }) {
  if (status === "active") return <Pill tone="success">Active</Pill>;
  if (status === "paused") return <Pill tone="danger">Paused</Pill>;
  if (status === "not_eligible") return <Pill>Below age gate</Pill>;
  return <Pill tone="warning">Awaiting consent</Pill>;
}

/* ================================ Alumni ================================ */

export function AlumniHome({ me }: { me: User }) {
  const { state } = useStore();
  const isMentor = activeBadge(me, "Mentor");
  const suspended = me.badges?.some((b) => b.type === "Mentor" && b.status === "suspended");
  const studentConvs = state.conversations.filter((c) => c.mentorId === me.id);
  const vouchReqs = state.verifications.filter((v) => v.status === "pending" && v.campusId === me.campusIds[0] && v.passYear === me.batch && !v.vouches.some((x) => x.by === me.id));
  const pendingBadge = state.badgeRequests.find((b) => b.userId === me.id && b.status === "pending");
  const pct = completeness(me);
  const liveJobs = state.jobs.filter((j) => j.status === "approved").length;
  const groupIds = groupsFor(me).map((g) => g.id);
  const posts = state.posts.filter((p) => groupIds.includes(p.groupId)).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 3);
  const events = state.events
    .filter((e) => e.audience.includes("ALU") && (e.campusIds === "all" || e.campusIds.includes(me.campusIds[0])))
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    .slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap gap-1.5">
            <Pill tone="success" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
              Verified alumni
            </Pill>
            {me.badges?.map((b) => (
              <Pill key={b.type} tone={b.status === "active" ? "primary" : "danger"}>
                {b.type}
                {b.status === "suspended" ? " · suspended" : ""}
              </Pill>
            ))}
          </div>
        }
        title={`Welcome back, ${firstName(me.name)}`}
        description={`Batch ${me.batch} · ${campusName(me.campusIds[0])}${me.company ? ` · ${me.title}, ${me.company}` : ""}`}
      />
      {suspended && (
        <Callout tone="danger" className="mb-5" title="Your Mentor badge is suspended">
          Your campus alumni office has paused your Mentor badge while they review a report. Students can&apos;t see you and your student chats are read-only.
        </Callout>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isMentor || suspended ? (
          <ActionCard
            href="/portal/messages"
            icon={MessagesSquare}
            title="Mentor inbox"
            body={`${studentConvs.length} student conversation${studentConvs.length === 1 ? "" : "s"} · all recorded`}
            cta="Open inbox"
          />
        ) : (
          <ActionCard
            href="/portal/mentor"
            icon={GraduationCap}
            title={pendingBadge ? "Mentor request pending" : "Become a mentor"}
            body={pendingBadge ? "Your campus is reviewing your request." : "Help students choose courses and colleges. Takes 2 minutes."}
            cta={pendingBadge ? "View status" : "Get started"}
            highlight={!pendingBadge}
          />
        )}
        <ActionCard
          href="/portal/vouch"
          icon={HeartHandshake}
          title="Vouch for batchmates"
          body={vouchReqs.length ? `${vouchReqs.length} batchmate${vouchReqs.length > 1 ? "s" : ""} from ${me.batch} waiting` : "No requests right now"}
          cta="Review"
          highlight={vouchReqs.length > 0}
        />
        <ActionCard href="/portal/directory" icon={Users} title="Alumni directory" body={`Find people from ${me.batch} and every campus by city, company or industry`} cta="Search alumni" />
        <ActionCard href="/portal/profile" icon={Sparkles} title={`Profile ${pct}% complete`} body={pct < 100 ? "Add work, education and skills so batchmates can find you" : "Your profile is complete"} cta="Edit profile" highlight={pct < 60} />
        <ActionCard href="/portal/jobs" icon={Briefcase} title="Jobs" body={`${liveJobs} live job${liveJobs === 1 ? "" : "s"} from alumni · post your own`} cta="Browse jobs" />
        <ActionCard href="/portal/invite" icon={Send} title="Invite friends" body="Bring your batchmates to VAA" cta="Invite" />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader title="Latest in your groups" action={<Link href="/portal/groups" className="text-[14px] font-semibold text-primary">Open</Link>} />
          <div className="divide-y divide-border">
            {posts.length === 0 && <p className="px-5 py-4 text-[14px] text-muted">No posts yet.</p>}
            {posts.map((p) => {
              const a = state.users.find((u) => u.id === p.authorId);
              return (
                <div key={p.id} className="flex gap-3 px-5 py-3">
                  <Avatar name={a?.name ?? "?"} size={32} />
                  <div className="min-w-0">
                    <p className="text-[14px]">
                      <span className="font-semibold">{a?.name}</span> <span className="text-muted">· {timeAgo(p.at)}</span>
                    </p>
                    <p className="line-clamp-2 text-[14px] text-muted">{p.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="min-w-0">
          <CardHeader title="Upcoming events" action={<Link href="/portal/events" className="text-[14px] font-semibold text-primary">All events</Link>} />
          <div className="divide-y divide-border">
            {events.map((e) => {
              const d = new Date(e.start);
              const going = e.rsvps.some((r) => r.userId === me.id && r.status === "going");
              return (
                <Link key={e.id} href="/portal/events" className="flex items-center gap-3 px-5 py-3 hover:bg-surface-2">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-center text-primary">
                    <span className="text-[11px] font-bold uppercase leading-none">{d.toLocaleDateString("en-IN", { month: "short" })}</span>
                    <span className="text-[16px] font-bold leading-none">{d.getDate()}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold">{e.title}</span>
                    <span className="block truncate text-[13px] text-muted">{e.venue}</span>
                  </span>
                  {going && <Pill tone="success">Going</Pill>}
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}

export function PendingAlumniHome({ me }: { me: User }) {
  const { state, answerInfoRequest } = useStore();
  const [reply, setReply] = useState("");
  const req = [...state.verifications].reverse().find((v) => v.userId === me.id);
  const vouches = req?.vouches.length ?? 0;

  if (req?.status === "rejected")
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader eyebrow={<Pill tone="danger">Not verified</Pill>} title={`Sorry ${firstName(me.name)}, we couldn't verify you`} description={`${campusName(req.campusId)} alumni office · ${req.decidedAt ? timeAgo(req.decidedAt) : ""}`} />
        <Card className="p-6">
          <p className="font-semibold">Reason</p>
          <p className="mt-1 text-[14.5px] text-muted">{req.note || "Your details didn't match school records."}</p>
          <p className="mt-5 font-semibold">What you can do</p>
          <ul className="mt-2 space-y-1.5 text-[14.5px] text-muted">
            <li>• Reply to the WhatsApp or email from your campus with a school ID or leaving certificate</li>
            <li>• If you think this is wrong, raise it under My profile → My data → Privacy complaint</li>
          </ul>
        </Card>
      </div>
    );

  if (req?.status === "info_requested")
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader eyebrow={<Pill tone="warning">Alumni – Pending</Pill>} title="Your campus needs a little more information" description={`${campusName(req.campusId)} alumni office · ${req.decidedAt ? timeAgo(req.decidedAt) : ""}`} />
        <Card className="p-6">
          <p className="font-semibold">They asked</p>
          <p className="mt-1 rounded-xl bg-surface-2 px-3.5 py-2.5 text-[14.5px]">{req.note || "Please share a school ID or leaving certificate."}</p>
          <label htmlFor="info-reply" className="mt-5 block font-semibold">
            Your reply
          </label>
          <textarea
            id="info-reply"
            rows={3}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="e.g. My admission number was VG-MAL-2006-0112. I've emailed a photo of my leaving certificate."
            className="mt-2 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[14.5px] outline-none focus:border-primary"
          />
          <Button className="mt-3" disabled={!reply.trim()} onClick={() => { answerInfoRequest(req.id, me.id, reply); setReply(""); }}>
            Send to the alumni office
          </Button>
          <p className="mt-2 text-[13px] text-muted">Your request goes back into the review queue. Vouching pauses until then.</p>
        </Card>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow={<Pill tone="warning">Alumni – Pending</Pill>} title={`Hi ${firstName(me.name)}, we're verifying you`} description="This keeps the community safe for students. It usually takes up to 2 working days." />
      <Card className="p-6">
        <ol className="space-y-5">
          <li className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <div>
              <p className="font-semibold">Details submitted</p>
              <p className="text-[14px] text-muted">
                Batch {req?.passYear ?? me.batch} · {campusName(me.campusIds[0])} {req && `· ${timeAgo(req.submittedAt)}`}
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="font-semibold">Campus alumni office review</p>
              <p className="text-[14px] text-muted">{req?.note ?? "Checking your details against school records."}</p>
            </div>
          </li>
          <li className="flex gap-3">
            <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">Or: two batchmates vouch for you</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(vouches / 2) * 100}%` }} />
                </div>
                <span className="text-[14px] font-semibold tabular-nums">{vouches} / 2</span>
              </div>
              {req?.vouches.map((v) => (
                <p key={v.by} className="mt-1.5 text-[13.5px] text-muted">
                  ✓ {v.byName} · {timeAgo(v.at)}
                </p>
              ))}
              {req && (
                <p className="mt-2 text-[13.5px] text-muted">
                  Share this link with verified batchmates: <span className="font-mono text-text">vaa.vibgyor.in/vouch/{req.id}</span>
                </p>
              )}
            </div>
          </li>
        </ol>
      </Card>
      <Callout tone="info" className="mt-5">
        While you wait, you can complete your profile. Directory, messaging and events open once you&apos;re verified.
      </Callout>
    </div>
  );
}

/* ================================ Staff ================================ */

export function StaffDashboard({ me }: { me: User }) {
  const { state } = useStore();
  const group = me.role === "GAO" || me.role === "SAD";
  const inScope = (cid: string) => group || me.campusIds.includes(cid);
  const scopeIdx = new Set(campuses.map((c, i) => (inScope(c.id) ? i : -1)).filter((i) => i >= 0));
  const pop = population.filter((p) => scopeIdx.has(p.campusIdx));

  const pendingV = state.verifications.filter((v) => v.status === "pending" && inScope(v.campusId)).length;
  const pendingB = state.badgeRequests.filter((b) => b.status === "pending" && inScope(b.campusId)).length;
  const openR = state.reports.filter((r) => r.kind === "message" && r.status === "open" && inScope(r.campusId));
  const students = state.users.filter((u) => u.role === "STU" && inScope(u.campusIds[0]) && u.studentStatus !== "not_eligible");
  const awaiting = students.filter((s) => s.studentStatus === "awaiting_consent").length;
  const verified = pop.filter((p) => p.verified).length;
  const mentors = pop.filter((p) => p.mentor).length + state.users.filter((u) => activeBadge(u, "Mentor") && inScope(u.campusIds[0])).length;
  const recent = state.audit.filter((a) => !a.campusId || inScope(a.campusId)).slice(0, 7);

  const completeness = [
    { label: "Profiles claimed / verified", v: Math.round((verified / Math.max(pop.length, 1)) * 100) },
    { label: "Professional details", v: 9 },
    { label: "Student 3C preferences", v: 64 },
    { label: "Parent information", v: 88 },
    { label: "Consent recorded", v: Math.round(((students.length - awaiting) / Math.max(students.length, 1)) * 100) },
  ];

  return (
    <>
      <PageHeader
        eyebrow={<Pill tone="primary">{group ? "All 39 campuses" : campusName(me.campusIds[0])}</Pill>}
        title={group ? "Group alumni dashboard" : "Campus dashboard"}
        description={`Signed in as ${roleLabels[me.role]}. ${group ? "You can see and act on every campus." : "You can see and act on your campus only."}`}
        actions={
          <Button href="/portal/admin/broadcast">
            <Megaphone className="h-4 w-4" /> New broadcast
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat label="Alumni records" value={fmt(pop.length)} sub={`${fmt(verified)} verified`} icon={<Users className="h-4 w-4" />} />
        <Stat label="Active mentors" value={fmt(mentors)} sub="Code of conduct signed" icon={<GraduationCap className="h-4 w-4" />} tone="success" />
        <Stat label="Open safety reports" value={openR.length} sub="Target: respond in 24h" icon={<ShieldAlert className="h-4 w-4" />} tone={openR.length ? "danger" : "neutral"} />
        <Stat label="Awaiting parent consent" value={awaiting} sub={`of ${students.length} students${group ? " in demo roster" : ""}`} icon={<ClipboardCheck className="h-4 w-4" />} tone="warning" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Work queues" subtitle="Everything that needs a person to act" />
          <div className="divide-y divide-border">
            <QueueRow href="/portal/admin/verification" icon={BadgeCheck} title="Alumni verifications" sub="Partial matches and peer vouches" count={pendingV} />
            <QueueRow href="/portal/admin/verification?tab=badges" icon={GraduationCap} title="Mentor badge requests" sub="Code of conduct accepted, awaiting approval" count={pendingB} />
            <QueueRow href="/portal/admin/safeguarding" icon={ShieldAlert} title="Safeguarding reports" sub="Auto-flags and user reports" count={openR.length} danger />
            <QueueRow href="/portal/admin/consents" icon={ClipboardCheck} title="Students awaiting consent" sub="Send reminders to parents" count={awaiting} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Data completeness" subtitle="Sample KPIs" action={<Req ids="M3" />} />
          <div className="space-y-4 p-5">
            {completeness.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-[14px]">
                  <span className="font-medium">{c.label}</span>
                  <span className="font-semibold tabular-nums">{c.v}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className={cn("h-full rounded-full", c.v < 30 ? "bg-danger" : c.v < 70 ? "bg-warning" : "bg-success")} style={{ width: `${c.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        {group ? <CampusTable /> : <ScopeNote />}
        <Card>
          <CardHeader title="Recent activity" action={<Link href="/portal/admin/audit" className="text-[14px] font-semibold text-primary">Audit log</Link>} />
          <div className="divide-y divide-border">
            {recent.map((a) => (
              <div key={a.id} className="px-5 py-3">
                <p className="text-[14px] font-medium">{a.action}</p>
                <p className="truncate text-[13px] text-muted">
                  {a.target} · {timeAgo(a.at)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function ScopeNote() {
  return (
    <Card className="p-6">
      <ShieldCheck className="h-7 w-7 text-primary" />
      <p className="mt-3 font-semibold">Campus-scoped access</p>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">
        Queues, reports, broadcasts and exports on this account are limited to your campus. The Group Alumni Office sees all 39 campuses. Every view of student data is recorded in the audit log.
      </p>
      <div className="mt-3 flex gap-1.5">
        <Req ids="A6" /> <Req ids="CS-16" />
      </div>
    </Card>
  );
}

function CampusTable() {
  const rows = campuses
    .map((c, i) => {
      const p = population.filter((r) => r.campusIdx === i);
      return { c, total: p.length, verified: p.filter((r) => r.verified).length, mentors: p.filter((r) => r.mentor).length };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Campuses" subtitle="Top 8 by alumni records" action={<Req ids="M1" />} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-[14px]">
          <thead>
            <tr className="border-b border-border text-left text-[13px] text-muted">
              <th className="px-5 py-2.5 font-semibold">Campus</th>
              <th className="px-3 py-2.5 text-right font-semibold">Alumni</th>
              <th className="px-3 py-2.5 text-right font-semibold">Verified</th>
              <th className="px-5 py-2.5 text-right font-semibold">Mentors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.c.id} className="hover:bg-surface-2/60">
                <td className="px-5 py-2.5 font-medium">
                  {r.c.name} <span className="text-muted">· {r.c.city}</span>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{r.total}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{Math.round((r.verified / r.total) * 100)}%</td>
                <td className="px-5 py-2.5 text-right tabular-nums">{r.mentors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function QueueRow({ href, icon: Icon, title, sub, count, danger }: { href: string; icon: typeof Users; title: string; sub: string; count: number; danger?: boolean }) {
  const color = pageIconFor(href.split("?")[0])?.color ?? "var(--primary)";
  return (
    <Link href={href} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2/60">
      <span className="icon-bounce grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold">{title}</p>
        <p className="truncate text-[13.5px] text-muted">{sub}</p>
      </div>
      <span className={cn("grid h-7 min-w-7 place-items-center rounded-full px-2 text-[14px] font-bold tabular-nums", count ? (danger ? "bg-danger text-white" : "bg-primary text-primary-fg") : "bg-surface-2 text-muted")}>
        {count}
      </span>
      <ArrowRight className="icon-nudge h-4 w-4 text-muted group-hover:text-primary" />
    </Link>
  );
}

/* ================================ Others ================================ */

const roleFeatures: Record<string, { summary: string; items: string[]; limits: string[] }> = {
  TCH: {
    summary: "Teachers and counsellors guide students and see mentor matches for their campus.",
    items: ["Student 3C preferences and interests", "Mentor match suggestions", "Career talk requests", "Campus events"],
    limits: ["Own campus only", "Can't broadcast or export", "2-factor login"],
  },
  FIN: {
    summary: "Finance & Commerce handles payments, donations, refunds and reconciliation (Release 3).",
    items: ["Payments dashboard", "80G receipts & Form 10BD export", "Refunds with credit notes", "Settlement reconciliation"],
    limits: ["Only campuses assigned by the Super Admin", "No directory or student data", "2-factor login"],
  },
  MCZ: {
    summary: "MyCareerZ counsellors see consented student preferences and enquiries for assigned campuses.",
    items: ["Consented leads in real time", "Opted-in alumni guides", "Funnel reports by campus", "Counselling bookings (R3)"],
    limits: ["Consented records and agreed fields only", "Sharing stops when consent is withdrawn", "2-factor login"],
  },
};

export function RoleOverview({ me }: { me: User }) {
  const f = roleFeatures[me.role];
  return (
    <>
      <PageHeader eyebrow={<Pill tone="primary">{roleLabels[me.role]}</Pill>} title={`Hello, ${firstName(me.name)}`} description={f?.summary} />
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader title="Your workspace" subtitle="Arrives in a later prototype phase" />
          <ul className="space-y-3 p-5">
            {f?.items.map((i) => (
              <li key={i} className="flex items-center gap-3 text-[14px]">
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-surface-2 text-muted">
                  <Clock className="h-3.5 w-3.5" />
                </span>
                {i}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Access limits" subtitle="Enforced for this role (RFQ §5.3–5.4)" />
          <ul className="space-y-3 p-5">
            {f?.limits.map((i) => (
              <li key={i} className="flex items-center gap-3 text-[14px]">
                <ShieldCheck className="h-[18px] w-[18px] text-success" /> {i}
              </li>
            ))}
            <li className="flex items-center gap-3 text-[14px]">
              <ShieldCheck className="h-[18px] w-[18px] text-success" /> Scope: {me.campusIds.length === 1 ? campusName(me.campusIds[0]) : `${me.campusIds.length} campuses`}
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}

function ActionCard({ href, icon: Icon, title, body, cta, highlight, disabled }: { href: string; icon: typeof Users; title: string; body: string; cta: string; highlight?: boolean; disabled?: boolean }) {
  const color = pageIconFor(href.split("?")[0])?.color ?? "var(--primary)";
  const inner = (
    <Card className={cn("group relative flex h-full flex-col overflow-hidden p-5", !disabled && "lift", highlight && "border-primary/40", disabled && "opacity-60")}>
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" style={{ background: color }} />
      <span
        className="icon-bounce grid h-11 w-11 place-items-center rounded-xl"
        style={highlight ? { background: color, color: "#fff" } : { color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-bold">{title}</p>
      <p className="mt-1 flex-1 text-[14px] text-muted">{body}</p>
      <span className={cn("mt-4 inline-flex items-center gap-1 text-[14px] font-semibold", disabled ? "text-muted" : "text-primary")}>
        {cta} {!disabled && <ArrowRight className="icon-nudge h-3.5 w-3.5" />}
      </span>
    </Card>
  );
  return disabled ? inner : <Link href={href}>{inner}</Link>;
}

