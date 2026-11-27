"use client";
/* eslint-disable @next/next/no-img-element -- static export with images.unoptimized */

import { allOk, check, clean, whenFilled } from "@/lib/validate";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, Send, ShieldCheck } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/Public";
import { Button, Callout, Card, Checkbox, Field, Input, Req, Select, Textarea } from "@/components/ui";
import { campuses } from "@/lib/data";
import { Emoji, photo, type EmojiName } from "@/components/Emoji";
import { Backdrop, EmojiSticker, LEAF, PillEyebrow, Underlined } from "@/components/Funk";
import { useStore } from "@/lib/store";

type Topic = "mycareerz" | "admissions" | "alumni";

function EnquiryForm() {
  const params = useSearchParams();
  const { log, pushOutbox } = useStore();
  const [topic, setTopic] = useState<Topic>((params.get("topic") as Topic) || "mycareerz");
  const [who, setWho] = useState("parent");
  const [form, setForm] = useState({ name: "", mobile: "", email: "", campus: "c01", message: "" });
  const [shareMcz, setShareMcz] = useState(false);
  const [done, setDone] = useState<null | { ref: string; ms: number }>(null);

  const studentMcz = who === "student" && topic === "mycareerz";
  const errs = { name: check.name(form.name), mobile: check.mobile(form.mobile, false), email: check.email(form.email, false) };
  const valid = allOk(...Object.values(errs)) && !!(form.mobile.trim() || form.email.trim()) && (topic !== "mycareerz" || shareMcz);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const ref = `${topic === "mycareerz" ? "MCZ" : topic === "admissions" ? "ADM" : "VAA"}-${Math.floor(100000 + Math.random() * 899999)}`;
    const ms = 600 + Math.floor(Math.random() * 900);
    setDone({ ref, ms });
    log({
      actorId: "system",
      action: topic === "mycareerz" ? "Lead sent to MyCareerZ CRM" : "Enquiry received",
      target: `${form.name} (${who})`,
      campusId: form.campus,
      category: "consent",
      detail: topic === "mycareerz" ? `${ref} · ${(ms / 1000).toFixed(1)}s · consent recorded${studentMcz ? " · held for parent consent" : ""}` : ref,
    });
    if (form.email)
      pushOutbox({
        channel: "email",
        to: `${form.name} · ${form.email}`,
        body: `Subject: We've received your enquiry (${ref})\n\nThank you. ${topic === "mycareerz" ? "A MyCareerZ counsellor" : "The VIBGYOR team"} will contact you within one working day.`,
      });
  };

  if (done)
    return (
      <Card className="mx-auto max-w-xl rounded-[1.75rem] rounded-tr-[4rem] p-8 text-center shadow-md">
        <span className="mx-auto grid h-20 w-20 -rotate-6 place-items-center rounded-3xl border border-border bg-surface shadow-lg">
          <Emoji name="party" size={48} />
        </span>
        <h1 className="mt-6 text-2xl font-semibold">
          Thank you, <Underlined>we&apos;ve got it</Underlined>
        </h1>
        <p className="mt-2 text-muted">Your reference is <span className="font-mono font-semibold text-text">{done.ref}</span>.</p>
        {topic === "mycareerz" && (
          <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl bg-surface-2 p-4 text-left text-sm">
            {studentMcz ? (
              <p className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" /> Held until your parent confirms consent. We&apos;ve asked them by SMS.
              </p>
            ) : (
              <p className="flex items-start gap-2">
                <Send className="mt-0.5 h-4 w-4 shrink-0 text-success" /> Delivered to the MyCareerZ CRM in {(done.ms / 1000).toFixed(1)}s
              </p>
            )}
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Consent recorded with notice version and time
            </p>
          </div>
        )}
        <Button href="/" variant="secondary" className="mt-7">
          Back to home
        </Button>
      </Card>
    );

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <div className="flex gap-2">
          <Req ids="J4" /> <Req ids="F5" /> <Req ids="MCZ-1" />
        </div>
        <div className="mt-4">
          <PillEyebrow emoji="mail">Contact</PillEyebrow>
        </div>
        <h1 className="mt-4 text-3xl font-semibold sm:text-[2.75rem] sm:leading-[1.12]">
          Get in <Underlined>touch</Underlined>
        </h1>
        <p className="mt-4 text-body leading-relaxed text-muted">The right team replies within one working day.</p>

        <div className="relative mt-8 hidden px-3 pt-3 lg:block">
          <Backdrop dots="left" />
          <div className={`relative overflow-hidden ${LEAF} shadow-lg ring-1 ring-black/5`}>
            <img src={photo("mentor-session")} alt="" className="aspect-[16/10] w-full object-cover" />
          </div>
          <EmojiSticker name="envelope" size={30} className="absolute -right-1 top-0 rotate-12" />
          <EmojiSticker name="chat" size={26} className="absolute -bottom-3 left-8 -rotate-6" />
        </div>

        <div className="mt-8 space-y-3">
          {(
            [
              ["classical", "Admissions", "Campus admissions team"],
              ["bulb", "MyCareerZ", "A career counsellor, with your consent"],
              ["graduation-cap", "Alumni office", "Records, reunions, documents"],
            ] as [EmojiName, string, string][]
          ).map(([e, t, d], i) => (
            <div
              key={t}
              className={`flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-xs transition-transform duration-300 hover:rotate-0 ${
                i % 2 ? "rotate-[0.5deg]" : "-rotate-[0.5deg]"
              }`}
            >
              <Emoji name={e} size={34} />
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-sm text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="rounded-[1.75rem] rounded-tr-[4rem] p-5 shadow-md sm:p-7">
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="I want to talk to" htmlFor="topic">
              <Select id="topic" value={topic} onChange={(e) => setTopic(e.target.value as Topic)}>
                <option value="mycareerz">MyCareerZ (career counselling)</option>
                <option value="admissions">Admissions</option>
                <option value="alumni">Alumni office</option>
              </Select>
            </Field>
            <Field label="I am a" htmlFor="who">
              <Select id="who" value={who} onChange={(e) => setWho(e.target.value)}>
                <option value="parent">Parent / guardian</option>
                <option value="student">Current VIBGYOR student</option>
                <option value="alumni">VIBGYOR alumnus</option>
                <option value="visitor">Other</option>
              </Select>
            </Field>
          </div>
          <Field label="Full name" htmlFor="name" error={whenFilled(form.name, errs.name)}>
            <Input id="name" value={form.name} invalid={!!whenFilled(form.name, errs.name)} onChange={(e) => setForm({ ...form, name: clean.name(e.target.value) })} placeholder="e.g. Neha Mehta" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mobile" htmlFor="mobile" error={errs.mobile} hint="Mobile or email: at least one">
              <Input id="mobile" type="tel" inputMode="tel" value={form.mobile} invalid={!!errs.mobile} onChange={(e) => setForm({ ...form, mobile: clean.mobile(e.target.value) })} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Email" htmlFor="email" error={errs.email}>
              <Input id="email" type="email" value={form.email} invalid={!!errs.email} onChange={(e) => setForm({ ...form, email: clean.email(e.target.value) })} placeholder="you@example.com" />
            </Field>
          </div>
          <Field label="Campus" htmlFor="campus">
            <Select id="campus" value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value })}>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.city}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Message" htmlFor="msg">
            <Textarea id="msg" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" />
          </Field>

          {topic === "mycareerz" && (
            <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-4">
              <Checkbox
                checked={shareMcz}
                onChange={setShareMcz}
                label="I agree to share these details with MyCareerZ"
                description="Name, contact details, campus and message only, so a counsellor can contact me. I can withdraw this at any time."
              />
              {studentMcz && (
                <Callout tone="warning" title="Students under 18">
                  We&apos;ll pass your enquiry to MyCareerZ only after your parent confirms consent. MyCareerZ will contact your parent, not you.
                </Callout>
              )}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={!valid}>
            Send enquiry
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function EnquiryPage() {
  return (
    <>
      <PublicHeader />
      <main className="overflow-hidden px-4 py-12 sm:px-6 sm:py-16">
        <Suspense>
          <EnquiryForm />
        </Suspense>
      </main>
      <PublicFooter />
    </>
  );
}
