"use client";

import { allOk, check, clean, whenFilled } from "@/lib/validate";
import Link from "next/link";
import { useState } from "react";
import { Briefcase, Building2, CheckCircle2, Clock, GraduationCap, MapPin, Plus, Search, ShieldCheck, Users } from "lucide-react";
import { Gate } from "@/components/Gate";
import { ReportButton } from "@/components/ReportButton";
import { MaskedText, MaskPreview } from "@/components/MaskPreview";
import { Avatar, Button, Callout, Card, Checkbox, Empty, Field, Input, Modal, PageHeader, Pill, Req, Select, Tabs, Textarea } from "@/components/ui";
import { campusName } from "@/lib/data";
import { activeBadge, useStore } from "@/lib/store";
import type { Job, JobType } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export default function JobsPage() {
  return (
    <Gate roles={["ALU", "STU"]}>
      <Jobs />
    </Gate>
  );
}

const statusPill: Record<Job["status"], React.ReactNode> = {
  pending: <Pill tone="warning" icon={<Clock className="h-3 w-3" />}>Waiting for approval</Pill>,
  approved: <Pill tone="success">Live</Pill>,
  rejected: <Pill tone="danger">Not approved</Pill>,
  closed: <Pill>Closed</Pill>,
};

function Jobs() {
  const { me, state, markInterest, closeJob } = useStore();
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | JobType>("all");
  const [posting, setPosting] = useState(false);
  const [interest, setInterest] = useState<Job | null>(null);
  const [note, setNote] = useState("");
  const [applicants, setApplicants] = useState<Job | null>(null);
  if (!me) return null;
  const student = me.role === "STU";
  const studentLocked = student && me.studentStatus !== "active";

  const n = q.trim().toLowerCase();
  const visible = state.jobs
    .filter((j) => (tab === "mine" ? j.postedBy === me.id : j.status === "approved" && (!student || j.forStudents)))
    .filter((j) => type === "all" || j.type === type)
    .filter((j) => !n || `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(n))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const mineCount = state.jobs.filter((j) => j.postedBy === me.id).length;

  return (
    <>
      <PageHeader
        eyebrow={<Req ids={student ? "E4 · E6 · CS-4" : "E4 · E5 · E6"} />}
        title={student ? "Internships" : "Jobs"}
        description={student ? "Internships and job-shadowing that your campus has approved for students." : "Jobs and referrals posted by VIBGYOR alumni. Every post is checked by a campus alumni office first."}
        actions={
          !student &&
          (activeBadge(me, "Recruiter") ? (
            <Button onClick={() => setPosting(true)}>
              <Plus className="h-4 w-4" /> Post a job
            </Button>
          ) : (
            <Button variant="secondary" href="/portal/badges">
              <Plus className="h-4 w-4" /> Become a Recruiter to post
            </Button>
          ))
        }
      />

      {student && (
        <Callout tone="safe" className="mb-5" title="How applying works for students">
          When you tap &quot;I&apos;m interested&quot;, your campus career counsellor gets the request, not the company. They check with your parent and help you apply.
        </Callout>
      )}

      {!student && (
        <div className="mb-4">
          <Tabs
            tabs={[
              { id: "all", label: "All jobs" },
              { id: "mine", label: "Posted by me", count: mineCount },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>
      )}

      <Card className="mb-4 flex flex-col gap-2 p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9" placeholder="Search title, company or city" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select className="sm:w-48" value={type} onChange={(e) => setType(e.target.value as typeof type)} aria-label="Job type">
          <option value="all">All types</option>
          {(["Full-time", "Internship", "Part-time", "Contract"] as JobType[]).map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
      </Card>

      {visible.length === 0 ? (
        <Card>
          <Empty icon={<Briefcase className="h-6 w-6" />} title={tab === "mine" ? "You haven't posted a job" : "No jobs match"}>
            {tab === "mine" ? "Post one: your campus will approve it within 2 working days." : "Try a different search."}
          </Empty>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {visible.map((j) => {
            const poster = state.users.find((u) => u.id === j.postedBy);
            const mine = j.postedBy === me.id;
            const done = j.interested.some((i) => i.userId === me.id);
            const myStatus = j.interested.find((i) => i.userId === me.id)?.counsellor;
            return (
              <Card key={j.id} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-snug">{j.title}</p>
                    <p className="text-[14px] text-muted">{j.company}</p>
                  </div>
                  {mine ? statusPill[j.status] : <Pill>{j.type}</Pill>}
                  {!mine && !student && <ReportButton kind="job" targetId={j.id} compact />}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px] text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {j.location}
                    {j.remote ? " · remote OK" : ""}
                  </span>
                  <span>{timeAgo(j.at)}</span>
                  {j.forStudents && !student && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" /> Open to students
                    </span>
                  )}
                </div>
                <p className="mt-3 line-clamp-3 flex-1 text-[14.5px] leading-relaxed">
                  <MaskedText text={j.description} />
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  {!student && poster && !mine && (
                    <Link href={`/portal/people/${poster.id}`} className="flex min-w-0 flex-1 items-center gap-2 text-[13.5px] text-muted hover:text-text">
                      <Avatar name={poster.name} size={24} />
                      <span className="truncate">
                        {poster.name} · Batch {poster.batch}
                      </span>
                    </Link>
                  )}
                  {student && <span className="flex-1 text-[13.5px] text-muted">Approved by {campusName(j.campusId)}</span>}
                  {mine ? (
                    <>
                      <span className="flex-1 text-[13.5px] text-muted">{j.interested.length} interested</span>
                      {j.status === "approved" && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => setApplicants(j)}>
                            <Users className="h-3.5 w-3.5" /> See who
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => closeJob(j.id, me.id)}>
                            Close
                          </Button>
                        </>
                      )}
                    </>
                  ) : done ? (
                    <p className="flex items-center gap-1.5 text-[14px] font-semibold text-success">
                      <CheckCircle2 className="h-4 w-4" />{" "}
                      {!student
                        ? "Interest sent"
                        : !myStatus
                          ? "Sent to your counsellor"
                          : myStatus.status === "checking"
                            ? "Counsellor is checking with your parent"
                            : myStatus.status === "passed_on"
                              ? "Passed on to the company"
                              : "Not taken forward"}
                    </p>
                  ) : (
                    <Button
                      size="sm"
                      disabled={studentLocked}
                      onClick={() => {
                        setInterest(j);
                        setNote("");
                      }}
                    >
                      I&apos;m interested
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {posting && <PostJob onClose={() => setPosting(false)} />}

      <Modal
        open={!!interest}
        onClose={() => setInterest(null)}
        title={interest ? `Interested in ${interest.title}?` : ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setInterest(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (interest) markInterest(interest.id, me.id, note.trim() || undefined);
                setInterest(null);
              }}
            >
              Send
            </Button>
          </>
        }
      >
        {student ? (
          <div className="space-y-3 text-[14px]">
            <p>
              We&apos;ll tell your campus career counsellor that you&apos;re interested in <b>{interest?.title}</b> at {interest?.company}.
            </p>
            <Callout tone="safe">The company won&apos;t see your details until your counsellor and parent agree.</Callout>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[14px] text-muted">
              {state.users.find((u) => u.id === interest?.postedBy)?.name} gets an email with your name, batch and current role
              {me.profile?.resumeName ? `, plus your resume (${me.profile.resumeName})` : ""}.
            </p>
            <Field label="Short note (optional)" htmlFor="note">
              <Textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why you'd be a good fit" />
            </Field>
          </div>
        )}
      </Modal>

      <Modal open={!!applicants} onClose={() => setApplicants(null)} title={`Interested in ${applicants?.title ?? ""}`}>
        {applicants?.interested.length ? (
          <div className="space-y-2">
            {applicants.interested.map((i) => {
              const u = state.users.find((x) => x.id === i.userId);
              return (
                <Link key={i.userId} href={`/portal/people/${i.userId}`} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5 hover:bg-border/60">
                  <Avatar name={u?.name ?? "?"} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-semibold">{u?.name}</span>
                    <span className="block truncate text-[13px] text-muted">{i.note ?? `Batch ${u?.batch} · ${timeAgo(i.at)}`}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-[14px] text-muted">No one yet.</p>
        )}
      </Modal>
    </>
  );
}

function PostJob({ onClose }: { onClose: () => void }) {
  const { me, postJob } = useStore();
  const [f, setF] = useState({ title: "", company: me?.company ?? "", location: me?.city ?? "", type: "Full-time" as JobType, remote: false, description: "", forStudents: false });
  if (!me) return null;
  const je = {
    title: whenFilled(f.title, check.text(f.title, "Job title", { min: 3 })),
    company: whenFilled(f.company, check.text(f.company, "Company")),
    location: whenFilled(f.location, check.text(f.location, "Location")),
    description: whenFilled(f.description, check.text(f.description, "Description", { min: 20, max: 3000 })),
  };
  const ok = allOk(check.text(f.title, "t", { min: 3 }), check.text(f.company, "c"), check.text(f.location, "l"), check.text(f.description, "d", { min: 20, max: 3000 }));
  return (
    <Modal
      open
      wide
      onClose={onClose}
      title="Post a job"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!ok}
            onClick={() => {
              postJob({ ...f, title: f.title.trim(), company: f.company.trim(), location: f.location.trim(), description: f.description.trim(), postedBy: me.id, campusId: me.campusIds[0] });
              onClose();
            }}
          >
            Send for approval
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Job title" htmlFor="jt" error={je.title}>
          <Input id="jt" value={f.title} invalid={!!je.title} onChange={(e) => setF({ ...f, title: clean.text(e.target.value) })} />
        </Field>
        <Field label="Company" htmlFor="jc" error={je.company}>
          <Input id="jc" value={f.company} invalid={!!je.company} onChange={(e) => setF({ ...f, company: clean.text(e.target.value) })} />
        </Field>
        <Field label="Location" htmlFor="jl" error={je.location}>
          <Input id="jl" value={f.location} invalid={!!je.location} onChange={(e) => setF({ ...f, location: clean.text(e.target.value) })} placeholder="e.g. Bengaluru" />
        </Field>
        <Field label="Type" htmlFor="jty">
          <Select id="jty" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as JobType })}>
            {(["Full-time", "Internship", "Part-time", "Contract"] as JobType[]).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description" htmlFor="jd" error={je.description} hint="At least 20 characters. Don't add phone numbers or personal emails: people mark interest through VAA.">
            <Textarea id="jd" rows={5} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </Field>
          <div className="mt-2">
            <MaskPreview text={f.description} />
          </div>
        </div>
        <div className="space-y-3 sm:col-span-2">
          <Checkbox checked={f.remote} onChange={(v) => setF({ ...f, remote: v })} label="Remote work is OK" />
          <Checkbox
            checked={f.forStudents}
            onChange={(v) => setF({ ...f, forStudents: v })}
            label="Also show to current students (internship / job-shadowing)"
            description="Your campus checks these extra carefully. Students apply through their career counsellor, never directly."
          />
        </div>
        <p className="flex items-center gap-1.5 text-[13.5px] text-muted sm:col-span-2">
          <ShieldCheck className="h-4 w-4" /> Reviewed by {campusName(me.campusIds[0])} alumni office before it goes live.
        </p>
      </div>
    </Modal>
  );
}
