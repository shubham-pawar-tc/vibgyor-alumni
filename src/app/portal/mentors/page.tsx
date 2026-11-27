"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, EyeOff, Lock, MapPin, MessageSquarePlus, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Avatar, Button, Callout, Card, Empty, Field, Input, Modal, PageHeader, Pill, Req, Select, Textarea } from "@/components/ui";
import { MaskPreview } from "@/components/MaskPreview";
import { campusName } from "@/lib/data";
import { activeBadge, hasConsent, useStore } from "@/lib/store";
import { AskMentorPermission } from "@/components/AskMentorPermission";
import type { ThreeC, User } from "@/lib/types";
import { firstName } from "@/lib/utils";

const ord = ["1st", "2nd", "3rd"];

function score(m: User, prefs: ThreeC[] = []) {
  let s = 0;
  const reasons: string[] = [];
  prefs.forEach((p, i) => {
    const w = 3 - i;
    const mainCourse = p.course.split(/[ (]/)[0].toLowerCase();
    if (m.college === p.college) {
      s += 50 * w;
      reasons.push(`Studied at your ${ord[i]} choice, ${p.college}`);
    }
    if (m.course?.toLowerCase().includes(mainCourse)) {
      s += 20 * w;
      if (!reasons.some((r) => r.includes("course"))) reasons.push(`Same course: ${m.course}`);
    }
    if (m.country === p.country) {
      s += 10 * w;
      if (!reasons.some((r) => r.includes("country") || r.includes(p.college))) reasons.push(`Studied in your ${ord[i]} choice country, ${p.country}`);
    }
  });
  const max = 80 * 3 + 10 * 2 + 10;
  // College matches are the strongest signal, so show them first
  reasons.sort((a, b) => Number(b.startsWith("Studied at")) - Number(a.startsWith("Studied at")));
  return { pct: Math.min(99, Math.round((s / max) * 100)), reasons };
}

export default function MentorsPage() {
  const { me, state, startConversation } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [course, setCourse] = useState("all");
  const [ask, setAsk] = useState<User | null>(null);
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");

  const mentors = useMemo(() => state.users.filter((u) => u.role === "ALU" && activeBadge(u, "Mentor")), [state.users]);
  const ranked = useMemo(
    () =>
      mentors
        .map((m) => ({ m, ...score(m, me?.threeC) }))
        .filter(({ m }) => (country === "all" || m.country === country) && (course === "all" || m.course === course))
        .filter(({ m }) => !q || `${m.name} ${m.college} ${m.course} ${m.company} ${m.field}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.pct - a.pct),
    [mentors, me?.threeC, country, course, q]
  );

  if (!me) return null;
  if (me.role !== "STU")
    return (
      <Callout tone="info" title="Student view">
        Mentor search is how students find alumni. Switch to Diya or Aarav to see it.
      </Callout>
    );

  if (me.studentStatus !== "active" || !hasConsent(state, me.id, "mentor")) {
    return (
      <Card className="mx-auto max-w-lg">
        <Empty icon={<Lock className="h-6 w-6" />} title="Mentor contact is switched off">
          {me.studentStatus !== "active"
            ? "Your account needs a parent's consent first."
            : "Your parent hasn't allowed (or has withdrawn) mentor contact. They can switch it on in their Parent portal."}
          <div className="flex justify-center">
            <AskMentorPermission me={me} />
          </div>
          <div className="mt-3 flex justify-center">
            <Req ids="CS-3" />
          </div>
        </Empty>
      </Card>
    );
  }

  const countries = [...new Set(mentors.map((m) => m.country!))].sort();
  const courses = [...new Set(mentors.map((m) => m.course!))].sort();

  return (
    <>
      <PageHeader
        eyebrow={
          <div className="flex gap-2">
            <Req ids="E1" /> <Req ids="CS-4" /> <Req ids="C7" />
          </div>
        }
        title="Find a mentor"
        description="Alumni mentors who've been where you want to go. Ranked by your 3C choices."
      />

      <Callout tone="safe" className="mb-5" title="You'll only ever see approved mentors">
        Every mentor is a verified VIBGYOR alumnus who has signed the safeguarding code. Conversations stay on the platform and are visible to your campus alumni office and your parent.
      </Callout>

      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search college, course or company" className="pl-10" aria-label="Search mentors" />
          </div>
          <Select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country">
            <option value="all">All countries</option>
            {countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select value={course} onChange={(e) => setCourse(e.target.value)} aria-label="Course">
            <option value="all">All courses</option>
            {courses.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
      </Card>

      {ranked.length === 0 ? (
        <Card>
          <Empty icon={<Search className="h-6 w-6" />} title="No mentors match those filters">
            Try a different country or course.
          </Empty>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ranked.map(({ m, pct, reasons }) => {
            const existing = state.conversations.find((c) => c.studentId === me.id && c.mentorId === m.id);
            return (
              <Card key={m.id} className="flex flex-col p-5">
                <div className="flex items-start gap-4">
                  <Avatar name={m.name} size={52} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{m.name}</p>
                      <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                    </div>
                    <p className="truncate text-sm text-muted">
                      {m.title}, {m.company}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted">
                      <MapPin className="h-3 w-3" /> {m.city} · Batch {m.batch}, {campusName(m.campusIds[0]).split(",")[0]}
                    </p>
                  </div>
                  {pct > 0 && (
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-semibold leading-none text-primary tabular-nums">{pct}%</p>
                      <p className="text-xs text-muted">match</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Pill tone="primary">{m.college}</Pill>
                  <Pill>{m.course}</Pill>
                  <Pill>{m.country}</Pill>
                </div>
                {reasons[0] && (
                  <p className="mt-3 flex items-start gap-2 text-sm font-medium text-success">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {reasons[0]}
                  </p>
                )}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{m.bio}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <span className="flex items-center gap-2 text-label text-muted">
                    <EyeOff className="h-3.5 w-3.5" /> Contact details hidden
                  </span>
                  {existing ? (
                    <Button size="sm" variant="secondary" onClick={() => router.push(`/portal/messages?c=${existing.id}`)}>
                      Continue chat
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        setAsk(m);
                        setTopic("");
                        setText("");
                      }}
                    >
                      <MessageSquarePlus className="h-4 w-4" /> Ask a question
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!ask}
        onClose={() => setAsk(null)}
        title={ask ? `Ask ${firstName(ask.name)} a question` : ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAsk(null)}>
              Cancel
            </Button>
            <Button
              disabled={!text.trim() || !topic.trim()}
              onClick={() => {
                if (!ask) return;
                const id = startConversation(me.id, ask.id, topic.trim(), text);
                setAsk(null);
                router.push(`/portal/messages?c=${id}`);
              }}
            >
              Send question
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Topic" htmlFor="topic">
            <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Applying to Imperial for Computing" />
          </Field>
          <Field label="Your question" htmlFor="q">
            <Textarea id="q" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Introduce yourself and ask one clear question." />
          </Field>
          <MaskPreview text={text} />
          <p className="flex items-start gap-2 text-sm text-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> This conversation is recorded and visible to your campus alumni office. Messages can&apos;t be deleted.
          </p>
        </div>
      </Modal>
    </>
  );
}
