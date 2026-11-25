"use client";

import { useState } from "react";
import { CheckCircle2, Eye, Lock, Plus, ShieldCheck, Trash2, Upload, X } from "lucide-react";
import { ProfileCard } from "@/components/ProfileCard";
import { Button, Callout, Card, CardHeader, Field, Input, PageHeader, Pill, Req, Select, Switch, Tabs } from "@/components/ui";
import { campusName, privateFieldLabels, visibilityLabels } from "@/lib/data";
import { completeness } from "@/lib/community";
import { useStore } from "@/lib/store";
import type { AlumniProfile, PrivateField, ThreeC, User, Visibility } from "@/lib/types";
import { uid } from "@/lib/utils";

export default function ProfilePage() {
  const { me } = useStore();
  if (!me) return null;
  if (me.role === "STU") return <StudentProfile me={me} />;
  if (me.role === "ALU" || me.role === "ALP") return <AlumniProfileEditor me={me} />;
  return <Card className="p-6 text-sm text-muted">Profiles are for alumni and students.</Card>;
}

/* ============================== Alumni ============================== */

function AlumniProfileEditor({ me }: { me: User }) {
  const { updateProfile } = useStore();
  const [tab, setTab] = useState<"edit" | "privacy" | "preview">("edit");
  const [saved, setSaved] = useState(false);
  const p = me.profile!;
  const pct = completeness(me);

  const save = (patch: Partial<AlumniProfile>, fields?: Partial<User>) => {
    updateProfile(me.id, patch, fields);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="B1 · B2 · B4–B8 · B16 · A10" />}
        title="My profile"
        description="Your story since VIBGYOR. You decide who sees each part."
        actions={saved ? <Pill tone="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>Saved</Pill> : undefined}
      />

      <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold">Profile {pct}% complete</span>
            <span className="text-muted">{pct < 100 ? "Complete profiles appear higher in the directory" : "Looking great"}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </Card>

      {me.role === "ALP" && (
        <Callout tone="warning" title="You can fill this in while we verify you" className="mb-5">
          Other alumni will see your profile once your campus confirms you. Until then you&apos;re not in the directory.
        </Callout>
      )}

      <div className="mb-5">
        <Tabs
          tabs={[
            { id: "edit", label: "Edit profile" },
            { id: "privacy", label: "Privacy" },
            { id: "preview", label: "Preview as others" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "edit" && <EditTab me={me} p={p} save={save} />}
      {tab === "privacy" && <PrivacyTab p={p} save={save} />}
      {tab === "preview" && <PreviewTab me={me} />}
    </>
  );
}

function EditTab({ me, p, save }: { me: User; p: AlumniProfile; save: (patch: Partial<AlumniProfile>, fields?: Partial<User>) => void }) {
  const [basics, setBasics] = useState({ headline: p.headline ?? "", city: me.city ?? "", country: me.country ?? "India", company: me.company ?? "", title: me.title ?? "", linkedin: p.linkedin ?? "" });
  const [newWork, setNewWork] = useState({ company: "", title: "", from: "", to: "" });
  const [newEdu, setNewEdu] = useState({ institution: "", degree: "", from: "", to: "" });
  const [ach, setAch] = useState("");
  const [skill, setSkill] = useState("");
  const set = (k: keyof typeof basics) => (e: React.ChangeEvent<HTMLInputElement>) => setBasics({ ...basics, [k]: e.target.value });

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader title="About you" subtitle={`Batch ${me.batch} · ${campusName(me.campusIds[0])} (from school records, can't be changed here)`} />
        <form
          className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save({ headline: basics.headline || undefined, linkedin: basics.linkedin || undefined }, { city: basics.city, country: basics.country, company: basics.company, title: basics.title });
          }}
        >
          <div className="sm:col-span-2">
            <Field label="Headline" htmlFor="hl" hint="Always visible to verified alumni, so leave out anything you have hidden in Privacy">
              <Input id="hl" value={basics.headline} onChange={set("headline")} placeholder="e.g. Product designer at Swiggy · Batch of 2015" />
            </Field>
          </div>
          <Field label="Job title" htmlFor="ti">
            <Input id="ti" value={basics.title} onChange={set("title")} />
          </Field>
          <Field label="Company" htmlFor="co">
            <Input id="co" value={basics.company} onChange={set("company")} />
          </Field>
          <Field label="City" htmlFor="ci">
            <Input id="ci" value={basics.city} onChange={set("city")} />
          </Field>
          <Field label="Country" htmlFor="cn">
            <Input id="cn" value={basics.country} onChange={set("country")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="LinkedIn" htmlFor="li">
              <Input id="li" value={basics.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/…" />
            </Field>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Work history" />
        <div className="space-y-2 p-5">
          {p.work.map((w) => (
            <div key={w.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold">{w.title}</p>
                <p className="truncate text-[12.5px] text-muted">
                  {w.company} · {w.from}–{w.to ?? "present"}
                </p>
              </div>
              <button onClick={() => save({ work: p.work.filter((x) => x.id !== w.id) })} className="text-muted hover:text-danger" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Input placeholder="Job title" value={newWork.title} onChange={(e) => setNewWork({ ...newWork, title: e.target.value })} />
            <Input placeholder="Company" value={newWork.company} onChange={(e) => setNewWork({ ...newWork, company: e.target.value })} />
            <Input placeholder="From (year)" inputMode="numeric" value={newWork.from} onChange={(e) => setNewWork({ ...newWork, from: e.target.value })} />
            <Input placeholder="To (blank = now)" inputMode="numeric" value={newWork.to} onChange={(e) => setNewWork({ ...newWork, to: e.target.value })} />
          </div>
          <Button
            variant="soft"
            size="sm"
            disabled={!newWork.title || !newWork.company || !newWork.from}
            onClick={() => {
              save({ work: [{ id: uid("w"), title: newWork.title, company: newWork.company, from: +newWork.from, to: newWork.to ? +newWork.to : undefined }, ...p.work] });
              setNewWork({ company: "", title: "", from: "", to: "" });
            }}
          >
            <Plus className="h-4 w-4" /> Add role
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Education after VIBGYOR" />
        <div className="space-y-2 p-5">
          {p.education.map((ed) => (
            <div key={ed.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold">{ed.institution}</p>
                <p className="truncate text-[12.5px] text-muted">
                  {ed.degree} · {ed.from}–{ed.to}
                </p>
              </div>
              <button onClick={() => save({ education: p.education.filter((x) => x.id !== ed.id) })} className="text-muted hover:text-danger" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Input placeholder="College / university" value={newEdu.institution} onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })} />
            <Input placeholder="Degree" value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} />
            <Input placeholder="From" inputMode="numeric" value={newEdu.from} onChange={(e) => setNewEdu({ ...newEdu, from: e.target.value })} />
            <Input placeholder="To" inputMode="numeric" value={newEdu.to} onChange={(e) => setNewEdu({ ...newEdu, to: e.target.value })} />
          </div>
          <Button
            variant="soft"
            size="sm"
            disabled={!newEdu.institution || !newEdu.from || !newEdu.to}
            onClick={() => {
              save({ education: [{ id: uid("e"), institution: newEdu.institution, degree: newEdu.degree, from: +newEdu.from, to: +newEdu.to }, ...p.education] });
              setNewEdu({ institution: "", degree: "", from: "", to: "" });
            }}
          >
            <Plus className="h-4 w-4" /> Add education
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Achievements & skills" />
        <div className="space-y-4 p-5">
          <div>
            <div className="flex flex-wrap gap-1.5">
              {p.achievements.map((a) => (
                <Chip key={a} onRemove={() => save({ achievements: p.achievements.filter((x) => x !== a) })}>★ {a}</Chip>
              ))}
            </div>
            <AddInline placeholder="Add an achievement" value={ach} setValue={setAch} onAdd={() => (save({ achievements: [...p.achievements, ach.trim()] }), setAch(""))} />
          </div>
          <div>
            <div className="flex flex-wrap gap-1.5">
              {p.skills.map((s) => (
                <Chip key={s} onRemove={() => save({ skills: p.skills.filter((x) => x !== s) })}>{s}</Chip>
              ))}
            </div>
            <AddInline placeholder="Add a skill" value={skill} setValue={setSkill} onAdd={() => (save({ skills: [...p.skills, skill.trim()] }), setSkill(""))} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Resume & what you're open to" />
        <div className="space-y-4 p-5">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 hover:bg-surface-2">
            <Upload className="h-5 w-5 text-muted" />
            <span className="min-w-0 flex-1 text-[13px]">
              <span className="block truncate font-semibold">{p.resumeName ?? "Upload your resume (PDF)"}</span>
              <span className="text-muted">Only shared with alumni whose job you mark interest in</span>
            </span>
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && save({ resumeName: e.target.files[0].name })} />
          </label>
          <div className="space-y-3">
            <Switch checked={p.openTo.hiring} onChange={(v) => save({ openTo: { ...p.openTo, hiring: v } })} label="I'm hiring" />
            <Switch checked={p.openTo.speaking} onChange={(v) => save({ openTo: { ...p.openTo, speaking: v } })} label="Happy to speak at school events" />
            <Switch checked={p.openTo.mentoring} onChange={(v) => save({ openTo: { ...p.openTo, mentoring: v } })} label="Open to mentoring alumni" />
          </div>
          <p className="text-[12px] text-muted">Mentoring students needs the Mentor badge (safeguarding check). See &quot;Become a mentor&quot;.</p>
        </div>
      </Card>
    </div>
  );
}

function Chip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-1 pl-3 pr-1.5 text-[12.5px] font-medium">
      {children}
      <button onClick={onRemove} className="grid h-5 w-5 place-items-center rounded-full hover:bg-border" aria-label="Remove">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function AddInline({ placeholder, value, setValue, onAdd }: { placeholder: string; value: string; setValue: (v: string) => void; onAdd: () => void }) {
  return (
    <form
      className="mt-2 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onAdd();
      }}
    >
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
      <Button type="submit" variant="secondary" disabled={!value.trim()}>
        Add
      </Button>
    </form>
  );
}

function PrivacyTab({ p, save }: { p: AlumniProfile; save: (patch: Partial<AlumniProfile>) => void }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader title="Who can see what" subtitle="Changes apply straight away" icon={<ShieldCheck className="h-5 w-5" />} />
        <div className="divide-y divide-border">
          {(Object.keys(privateFieldLabels) as PrivateField[]).map((f) => (
            <div key={f} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center">
              <p className="flex-1 text-[14px] font-medium">{privateFieldLabels[f]}</p>
              <Select className="sm:w-56" value={p.privacy[f]} onChange={(e) => save({ privacy: { ...p.privacy, [f]: e.target.value as Visibility } })}>
                {(Object.keys(visibilityLabels) as Visibility[]).map((v) => (
                  <option key={v} value={v}>
                    {visibilityLabels[v]}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>
      </Card>
      <div className="space-y-4">
        <Callout tone="safe" title="Always private">
          Students and parents can never browse the alumni directory. They only see mentors who hold the Mentor badge, and never your email or mobile.
        </Callout>
        <Callout tone="info" title="Your campus office">
          Alumni office staff can see your full record to keep it accurate. Every time they open it, it&apos;s written to the audit log.
        </Callout>
        <p className="flex items-center gap-1.5 text-[12px] text-muted">
          <Lock className="h-3.5 w-3.5" /> DPDP Act 2023: you can download or delete your data at any time (Phase 3).
        </p>
      </div>
    </div>
  );
}

function PreviewTab({ me }: { me: User }) {
  const { state } = useStore();
  const [as, setAs] = useState<"other" | "batch" | "student">("other");
  const pretend: User | undefined =
    as === "student"
      ? state.users.find((u) => u.role === "STU")
      : as === "batch"
        ? { ...me, id: "preview-batch" , role: "ALU" }
        : { ...me, id: "preview-other", role: "ALU", batch: (me.batch ?? 2010) + 3 };
  return (
    <>
      <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 text-[13.5px] font-semibold">
          <Eye className="h-4 w-4 text-primary" /> See your profile as…
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "other", label: "Alumni from another batch" },
            { id: "batch", label: "A batchmate" },
            { id: "student", label: "A student" },
          ].map((o) => (
            <button
              key={o.id}
              onClick={() => setAs(o.id as typeof as)}
              className={`rounded-full border px-3 py-1.5 text-[13px] font-medium ${as === o.id ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-surface-2"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Card>
      {as === "student" ? (
        <Card className="p-6">
          <Callout tone="safe" title="Students can't see you">
            Your profile is not shown to students or parents. If you get the Mentor badge, students see only your name, batch, college, course, current role and short bio, never your contact details.
          </Callout>
        </Card>
      ) : (
        <ProfileCard owner={me} viewer={pretend} />
      )}
    </>
  );
}

/* ============================== Student ============================== */

function StudentProfile({ me }: { me: User }) {
  const { state, updateProfile } = useStore();
  const [threeC, setThreeC] = useState<ThreeC[]>(me.threeC ?? [{ country: "", course: "", college: "" }]);
  const [interest, setInterest] = useState("");
  const [saved, setSaved] = useState(false);
  const parents = (me.parentIds ?? []).map((id) => state.users.find((u) => u.id === id)).filter(Boolean) as User[];

  const save = (fields: Partial<User>) => {
    updateProfile(me.id, {}, fields);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="B10 · B11 · B13" />}
        title="My profile"
        description="Your choices help us match you with the right mentors."
        actions={saved ? <Pill tone="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>Saved</Pill> : undefined}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="My 3C choices" subtitle="Country · Course · College, in order of preference" />
            <div className="space-y-3 p-5">
              {threeC.map((c, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-xl bg-surface-2 p-3 sm:grid-cols-[28px_1fr_1fr_1fr_32px] sm:items-center">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-[12px] font-bold text-primary">{i + 1}</span>
                  <Input placeholder="Country" value={c.country} onChange={(e) => setThreeC(threeC.map((x, j) => (j === i ? { ...x, country: e.target.value } : x)))} />
                  <Input placeholder="Course" value={c.course} onChange={(e) => setThreeC(threeC.map((x, j) => (j === i ? { ...x, course: e.target.value } : x)))} />
                  <Input placeholder="College" value={c.college} onChange={(e) => setThreeC(threeC.map((x, j) => (j === i ? { ...x, college: e.target.value } : x)))} />
                  <button onClick={() => setThreeC(threeC.filter((_, j) => j !== i))} className="grid h-8 w-8 place-items-center text-muted hover:text-danger" aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex justify-between gap-2">
                <Button variant="soft" size="sm" disabled={threeC.length >= 3} onClick={() => setThreeC([...threeC, { country: "", course: "", college: "" }])}>
                  <Plus className="h-4 w-4" /> Add a choice
                </Button>
                <Button size="sm" onClick={() => save({ threeC: threeC.filter((c) => c.country || c.course || c.college) })}>
                  Save choices
                </Button>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Interests" subtitle="Clubs, sports, competitions, anything you enjoy" />
            <div className="p-5">
              <div className="flex flex-wrap gap-1.5">
                {(me.interests ?? []).map((t) => (
                  <Chip key={t} onRemove={() => save({ interests: (me.interests ?? []).filter((x) => x !== t) })}>{t}</Chip>
                ))}
              </div>
              <AddInline placeholder="e.g. Debate club" value={interest} setValue={setInterest} onAdd={() => (save({ interests: [...(me.interests ?? []), interest.trim()] }), setInterest(""))} />
            </div>
          </Card>
        </div>
        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <p className="text-[13px] font-semibold">From school records</p>
            <dl className="mt-3 space-y-2 text-[13px]">
              <div className="flex justify-between"><dt className="text-muted">Name</dt><dd className="font-medium">{me.name}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Class</dt><dd className="font-medium">{me.className}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Campus</dt><dd className="font-medium">{campusName(me.campusIds[0])}</dd></div>
            </dl>
            <p className="mt-3 text-[12px] text-muted">Wrong? Ask your class teacher to update the school record.</p>
          </Card>
          <Card className="p-5">
            <p className="text-[13px] font-semibold">My parent / guardian</p>
            {parents.map((pa) => (
              <div key={pa.id} className="mt-3 rounded-xl bg-surface-2 px-3 py-2.5 text-[13px]">
                <p className="font-semibold">{pa.name}</p>
                <p className="text-muted">Gives consent and can see your activity</p>
              </div>
            ))}
          </Card>
          <Callout tone="safe" title="Who sees your profile?">
            Only mentors you message see your first name, class and 3C choices. You&apos;re never listed in the alumni directory, and your contact details are never shown.
          </Callout>
        </div>
      </div>
    </>
  );
}
