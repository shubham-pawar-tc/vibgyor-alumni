"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, MapPin, Search, SlidersHorizontal, Users } from "lucide-react";
import { Gate } from "@/components/Gate";
import { Avatar, Card, Empty, Input, PageHeader, Pill, Req, Select } from "@/components/ui";
import { campuses, campusName } from "@/lib/data";
import { canSee, completeness } from "@/lib/community";
import { activeBadge, can, useStore } from "@/lib/store";
import { NoPermission } from "@/components/admin";
import { fmt } from "@/lib/utils";

export default function DirectoryPage() {
  return (
    <Gate roles={["ALU", "CAD", "GAO", "SAD"]}>
      <Directory />
    </Gate>
  );
}

function Directory() {
  const { me, state } = useStore();
  const staffBlocked = !!me && ["CAD", "GAO", "SAD"].includes(me.role) && !can(state, me, "records.view");
  const [q, setQ] = useState("");
  const [campus, setCampus] = useState("all");
  const [batch, setBatch] = useState("all");
  const [country, setCountry] = useState("all");
  const [field, setField] = useState("all");
  const [only, setOnly] = useState<"" | "hiring" | "mentor" | "mybatch">("");

  const alumni = state.users.filter((u) => u.role === "ALU" && !u.deactivated && u.id !== me?.id);
  const opts = useMemo(
    () => ({
      batches: [...new Set(alumni.map((u) => u.batch!))].sort((a, b) => b - a),
      countries: [...new Set(alumni.map((u) => u.country).filter(Boolean) as string[])].sort(),
      fields: [...new Set(alumni.map((u) => u.field).filter(Boolean) as string[])].sort(),
      campuses: campuses.filter((c) => alumni.some((u) => u.campusIds[0] === c.id)),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.users]
  );

  if (!me) return null;
  if (staffBlocked)
    return (
      <Card className="p-6">
        <NoPermission what="view alumni records" />
      </Card>
    );
  const n = q.trim().toLowerCase();
  const list = alumni
    .filter((u) => campus === "all" || u.campusIds[0] === campus)
    .filter((u) => batch === "all" || String(u.batch) === batch)
    .filter((u) => country === "all" || (u.country === country && canSee(me, u, "city")))
    .filter((u) => field === "all" || u.field === field)
    .filter((u) => only !== "hiring" || u.profile?.openTo.hiring)
    .filter((u) => only !== "mentor" || activeBadge(u, "Mentor"))
    .filter((u) => only !== "mybatch" || (u.batch === me.batch && u.campusIds[0] === me.campusIds[0]))
    .filter(
      (u) =>
        !n ||
        u.name.toLowerCase().includes(n) ||
        (canSee(me, u, "company") && u.company?.toLowerCase().includes(n)) ||
        (canSee(me, u, "education") && u.college?.toLowerCase().includes(n)) ||
        u.field?.toLowerCase().includes(n)
    )
    .sort((a, b) => completeness(b) - completeness(a) || a.name.localeCompare(b.name));

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="C1 · A10" />}
        title="Alumni directory"
        description={`Find VIBGYOR alumni from all 39 campuses. You only see what each person has chosen to share.`}
      />
      <Card className="mb-5 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9" placeholder="Search by name, company, college or industry" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          <Select value={campus} onChange={(e) => setCampus(e.target.value)} aria-label="Campus">
            <option value="all">All campuses</option>
            {opts.campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Batch">
            <option value="all">All batches</option>
            {opts.batches.map((b) => (
              <option key={b} value={b}>
                Batch {b}
              </option>
            ))}
          </Select>
          <Select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country">
            <option value="all">All countries</option>
            {opts.countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select value={field} onChange={(e) => setField(e.target.value)} aria-label="Industry">
            <option value="all">All industries</option>
            {opts.fields.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted" />
          {[
            { id: "mybatch", label: "My batch" },
            { id: "hiring", label: "Hiring" },
            { id: "mentor", label: "Mentors" },
          ].map((o) => (
            <button
              key={o.id}
              onClick={() => setOnly(only === o.id ? "" : (o.id as typeof only))}
              className={`rounded-full border px-3 py-1 text-[13.5px] font-medium ${only === o.id ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-surface-2"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Card>

      <p className="mb-3 text-[14px] text-muted">
        {list.length} {list.length === 1 ? "person" : "people"} · prototype shows {alumni.length} sample profiles out of {fmt(4650)} alumni
      </p>

      {list.length === 0 ? (
        <Card>
          <Empty icon={<Users className="h-6 w-6" />} title="No one matches">
            Try removing a filter.
          </Empty>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((u) => (
            <Link key={u.id} href={`/portal/people/${u.id}`} className="block">
              <Card className="h-full p-4 transition-colors hover:border-primary/50">
                <div className="flex items-start gap-3">
                  <Avatar name={u.name} size={46} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{u.name}</p>
                    <p className="truncate text-[13.5px] text-muted">
                      {u.title}
                      {canSee(me, u, "company") && u.company ? ` · ${u.company}` : ""}
                    </p>
                    <p className="mt-1 text-[13px] text-muted">
                      Batch {u.batch} · {campusName(u.campusIds[0])}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
                  {canSee(me, u, "city") && u.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {u.city}
                    </span>
                  )}
                  {!canSee(me, u, "company") && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" /> company hidden
                    </span>
                  )}
                  <span className="flex-1" />
                  {u.profile?.openTo.hiring && <Pill tone="info">Hiring</Pill>}
                  {activeBadge(u, "Mentor") && <Pill tone="primary">Mentor</Pill>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
