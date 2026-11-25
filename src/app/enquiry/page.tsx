"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, Send, ShieldCheck } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/Public";
import { Button, Callout, Card, Checkbox, Field, Input, Req, Select, Textarea } from "@/components/ui";
import { campuses } from "@/lib/data";
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
  const valid = form.name.trim() && (form.mobile.trim() || form.email.trim()) && (topic !== "mycareerz" || shareMcz);

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
      <Card className="mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success-soft text-success">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">Thank you, we&apos;ve got it</h1>
        <p className="mt-2 text-muted">Your reference is <span className="font-mono font-semibold text-text">{done.ref}</span>.</p>
        {topic === "mycareerz" && (
          <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl bg-surface-2 p-4 text-left text-[13px]">
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
        <div className="flex gap-1.5">
          <Req ids="J4" /> <Req ids="F5" /> <Req ids="MCZ-1" />
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Get in touch</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Questions about admissions, the alumni association or MyCareerZ career counselling? Send us a note and the right team will reply within one working day.
        </p>
        <div className="mt-8 space-y-4">
          {[
            ["Admissions", "Routed to the campus admissions team"],
            ["MyCareerZ", "Sent straight to a MyCareerZ counsellor, with your consent"],
            ["Alumni office", "For alumni records, reunions and documents"],
          ].map(([t, d]) => (
            <div key={t} className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-[13px] text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="p-5 sm:p-7">
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
          <Field label="Full name" htmlFor="name">
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Neha Mehta" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mobile" htmlFor="mobile">
              <Input id="mobile" inputMode="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91" />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
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
      <main className="px-4 py-12 sm:px-6 sm:py-16">
        <Suspense>
          <EnquiryForm />
        </Suspense>
      </main>
      <PublicFooter />
    </>
  );
}
