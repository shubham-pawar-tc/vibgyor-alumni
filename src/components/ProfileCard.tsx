"use client";

import { Award, Briefcase, Building2, FileText, GraduationCap, Linkedin, Lock, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { campusName } from "@/lib/data";
import { canSee } from "@/lib/community";
import { activeBadge } from "@/lib/store";
import type { PrivateField, User } from "@/lib/types";
import { Avatar, Card, Pill } from "./ui";

function Hidden({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-muted/80">
      <Lock className="h-3 w-3" /> {label} hidden
    </span>
  );
}

/** A profile as `viewer` is allowed to see it. Pass `viewer` = a pretend viewer to preview privacy. */
export function ProfileCard({ owner, viewer, actions }: { owner: User; viewer: User | undefined; actions?: React.ReactNode }) {
  const p = owner.profile;
  const see = (f: PrivateField) => canSee(viewer, owner, f);
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="spectrum h-1.5" />
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
          <Avatar name={owner.name} size={76} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">{owner.name}</h2>
              {owner.role === "ALU" && <Pill tone="success">Verified alumni</Pill>}
              {owner.role === "ALP" && <Pill tone="warning">Verification pending</Pill>}
              {activeBadge(owner, "Mentor") && <Pill tone="primary">Mentor</Pill>}
            </div>
            <p className="mt-1 text-[14px] text-muted">{p?.headline ?? `${owner.title ?? ""}${see("company") && owner.company ? ` at ${owner.company}` : ""}`}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[14px]">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-muted" /> Batch {owner.batch} · {campusName(owner.campusIds[0])}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted" /> {see("city") ? (owner.city ?? "—") + (owner.country && owner.country !== "India" ? `, ${owner.country}` : "") : <Hidden label="City" />}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-muted" /> {see("company") ? (owner.company ?? "—") : <Hidden label="Company" />}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[14px]">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-muted" /> {see("email") ? owner.email : <Hidden label="Email" />}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-muted" /> {see("mobile") ? owner.mobile : <Hidden label="Mobile" />}
              </span>
            </div>
            {p && (p.openTo.mentoring || p.openTo.hiring || p.openTo.speaking) && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.openTo.hiring && <Pill tone="info">Hiring</Pill>}
                {p.openTo.mentoring && <Pill tone="primary">Open to mentoring</Pill>}
                {p.openTo.speaking && <Pill>Happy to speak at events</Pill>}
              </div>
            )}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">{actions}</div>}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <p className="mb-3 flex items-center gap-2 text-[14px] font-semibold">
            <Briefcase className="h-4 w-4 text-primary" /> Work
          </p>
          {!see("work") ? (
            <p className="text-[14px]"><Hidden label="Work history" /></p>
          ) : p?.work.length ? (
            <ol className="relative space-y-4 border-l-2 border-border pl-4">
              {p.work.map((w) => (
                <li key={w.id} className="relative">
                  <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-surface bg-primary" />
                  <p className="text-[14.5px] font-semibold">{w.title}</p>
                  <p className="text-[14px] text-muted">
                    {w.to || see("company") ? w.company : "Company hidden"} · {w.from}–{w.to ?? "present"}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[14px] text-muted">Nothing added yet.</p>
          )}
        </Card>
        <Card className="p-5">
          <p className="mb-3 flex items-center gap-2 text-[14px] font-semibold">
            <GraduationCap className="h-4 w-4 text-primary" /> Education
          </p>
          <ol className="relative space-y-4 border-l-2 border-border pl-4">
            {see("education") &&
              p?.education.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-surface bg-primary" />
                  <p className="text-[14.5px] font-semibold">{e.institution}</p>
                  <p className="text-[14px] text-muted">
                    {e.degree} · {e.from}–{e.to}
                  </p>
                </li>
              ))}
            <li className="relative">
              <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-surface bg-[oklch(0.62_0.19_25)]" />
              <p className="text-[14.5px] font-semibold">VIBGYOR High, {campusName(owner.campusIds[0])}</p>
              <p className="text-[14px] text-muted">School · passed out {owner.batch}</p>
            </li>
          </ol>
          {!see("education") && <p className="mt-3 text-[14px]"><Hidden label="Higher education" /></p>}
        </Card>
      </div>

      {p && (p.achievements.length > 0 || p.skills.length > 0 || p.linkedin || p.resumeName) && (
        <Card className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[14px] font-semibold">
              <Award className="h-4 w-4 text-primary" /> Achievements
            </p>
            {p.achievements.length ? (
              <ul className="space-y-1.5 text-[14px]">
                {p.achievements.map((a) => (
                  <li key={a} className="flex gap-2">
                    <span className="text-primary">★</span> {a}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-muted">—</p>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[14px] font-semibold">
                <Sparkles className="h-4 w-4 text-primary" /> Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.skills.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
              </div>
            </div>
            {p.linkedin && (
              <p className="flex items-center gap-2 text-[14px]">
                <Linkedin className="h-4 w-4 text-muted" /> {p.linkedin}
              </p>
            )}
            {p.resumeName && (
              <p className="flex items-center gap-2 text-[14px]">
                <FileText className="h-4 w-4 text-muted" /> {p.resumeName}
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
